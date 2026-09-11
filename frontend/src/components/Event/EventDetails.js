import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../api';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  useEffect(() => {
    axios.get(`${API_URL}/events/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(response => setEvent(response.data)).catch(err => setError(err.response?.data?.message || 'Unable to load event'));
  }, [id]);
  if (error) return <div className="page-container"><p>{error}</p></div>;
  if (!event) return <div className="page-container"><p>Loading event…</p></div>;
  const count = event.bookedBy?.length || 0;
  const closed = event.registrationDeadline && new Date() > new Date(event.registrationDeadline);
  const registered = event.bookedBy?.some(id => String(id) === String(user?._id));
  const register = async () => { setBusy(true); try { await axios.post(`${API_URL}/events/${id}/register`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); setEvent({ ...event, bookedBy: [...(event.bookedBy || []), user._id] }); } catch (err) { setError(err.response?.data?.message || 'Registration failed'); } finally { setBusy(false); } };
  return <div className="page-container event-details">
    {event.image && <img src={event.image} alt={event.title} className="event-image" />}
    <h1>{event.title}</h1><p>{event.description}</p>
    <p>{event.category} · {new Date(event.date).toLocaleDateString()} · {event.time} · {event.venue}</p>
    <p>{count}/{event.capacity} participants</p>
    <strong>{event.status || 'upcoming'} · {closed ? 'Registration Closed' : count >= event.capacity ? 'Event Full' : 'Registration Open'}</strong>
    {user?.role === 'PARTICIPANT' && <button disabled={busy || registered || closed || count >= event.capacity} onClick={register}>{registered ? 'Already Registered' : closed ? 'Registration Closed' : count >= event.capacity ? 'Event Full' : busy ? 'Registering…' : 'Register Now'}</button>}
  </div>;
}
