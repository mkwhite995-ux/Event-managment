import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, Edit, Trash2, CheckCircle, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../api';

const EventCard = ({ event, isAdmin, onEventDeleted, fetchEvents }) => {
  const [showBookings, setShowBookings] = useState(false);

  const [bookedUsers, setBookedUsers] = useState([]);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdminUser = user?.role === 'ADMIN';
  const isOrganizerOwner = user?.role === 'ORGANIZER' && String(event.organizerId || event.createdBy) === String(user?._id);
  const canManage = isAdminUser || isOrganizerOwner;

  const handleDeleteEvent = async () => {
    if (!canManage) return;

    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${API_URL}/events/${event._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Event deleted successfully');
        if (onEventDeleted) onEventDeleted(event._id);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const handleBookEvent = async () => {
    if (!token || !user) {
      toast.error('Please login to book events');
      return;
    }

    const loadingToast = toast.loading('Booking event...');

    try {
      const response = await axios.post(
        `${API_URL}/events/${event._id}/book`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Event booked successfully!', {
          id: loadingToast,
        });
        if (fetchEvents) fetchEvents();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to book event',
        { id: loadingToast }
      );
    }
  };

  const handleCancelBooking = async () => {
    if (!token || !user) {
      toast.error('Please login first');
      return;
    }

    const loadingToast = toast.loading('Cancelling booking...');

    try {
      const response = await axios.delete(
        `${API_URL}/events/${event._id}/book`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Booking cancelled successfully!', {
          id: loadingToast,
        });
        if (fetchEvents) fetchEvents();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to cancel booking',
        { id: loadingToast }
      );
    }
  };

  const getUserName = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user.name;
    } catch (error) {
      return 'Unknown User';
    }
  };

  useEffect(() => {
    const fetchBookedUsers = async () => {
      if (showBookings && event.bookedBy?.length > 0) {
        const users = await Promise.all(event.bookedBy.map((userId) => getUserName(userId)));
        setBookedUsers(users);
      }
    };

    fetchBookedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBookings, event.bookedBy]);

  const isEventFull = event.bookedBy?.length >= event.capacity;
  const isAlreadyBooked = event.bookedBy?.some((bookedUserId) => String(bookedUserId) === String(user?._id));
  const availableSpots = event.capacity - (event.bookedBy?.length || 0);

  return (
    <motion.div 
      className="event-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <img src={event.image || '/assets/default-image.jpeg'} alt={event.title} className="event-image" />
      <div className="event-content">
        <Link to={`/events/${event._id}`}><h3 className="event-title">{event.title}</h3></Link>
        <div className="event-meta">
          <div className="meta-item">
            <Calendar size={16} />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="meta-item">
            <Clock size={16} />
            {event.time}
          </div>
          <div className="meta-item">
            <MapPin size={16} />
            {event.venue}
          </div>
          <div className="meta-item">
            <Users size={16} />
            {availableSpots} spots left
          </div>
        </div>
        <p className="event-description">{event.description}</p>
        
        {isAdminUser && (
          <div className="event-bookings">
            <button 
              className="view-bookings-btn"
              onClick={() => setShowBookings(!showBookings)}
            >
              <Users size={16} />
              {showBookings ? 'Hide Bookings' : 'View Bookings'} ({event.bookedBy?.length || 0})
            </button>
            
            {showBookings && bookedUsers.length > 0 && (
            <div className="bookings-list">
              <h4>Booked Users:</h4>
              <div className="booked-users">
                {bookedUsers.map((userName, index) => (
                  <div key={index} className="booked-user">
                    <User size={14} />
                    <span>{userName}</span>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="event-footer">
          <div className="event-price">
            {event.price === 0 ? 'Free' : `₹${event.price}`}
          </div>
          <div className="event-actions">
            {canManage ? (
              <>
                <Link to={`/update-event/${event._id}`}>
                  <motion.button 
                    className="action-button edit-action"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit event"
                  >
                    <Edit size={16} />
                    Edit
                  </motion.button>
                </Link>
                <motion.button 
                  className="action-button danger-action"
                  onClick={handleDeleteEvent}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Delete event"
                >
                  <Trash2 size={16} />
                  Delete
                </motion.button>
              </>
            ) : user?.role === 'PARTICIPANT' ? (
              <>
                {isAlreadyBooked ? (
                  <motion.button
                    className="action-button cancel-action"
                    onClick={handleCancelBooking}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle size={16} />
                    Cancel Booking
                  </motion.button>
                ) : (
                  <motion.button
                    className={`action-button ${isEventFull ? 'disabled-action' : 'primary-action'}`}
                    onClick={handleBookEvent}
                    disabled={isEventFull}
                    whileHover={!isEventFull ? { scale: 1.05 } : {}}
                    whileTap={!isEventFull ? { scale: 0.95 } : {}}
                  >
                    {isEventFull ? 'Event Full' : 'Book Now'}
                  </motion.button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
