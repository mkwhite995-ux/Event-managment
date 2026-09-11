import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './OrganizerDashboard.css';
import { API_URL } from '../../api';

export default function OrganizerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await axios.get(`${API_URL}/organizer/dashboard`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setData(response.data);
    } catch (err) { setError(err.response?.data?.message || 'Unable to load organizer dashboard'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <main className="organizer-dashboard"><p>Loading dashboard...</p></main>;
  if (error) return <main className="organizer-dashboard"><p className="dashboard-error">{error}</p><button onClick={load}>Retry</button></main>;
  const events = data?.myEvents || [];
  return <main className="organizer-dashboard">
    <div className="dashboard-heading"><h1>Organizer Dashboard</h1><Link className="dashboard-create" to="/create-event">Create Event</Link></div>
    <section className="dashboard-stats"><article><span>Total Events Created</span><strong>{data.totalEvents}</strong></article><article><span>Total Registrations</span><strong>{data.totalRegistrations}</strong></article><article><span>Upcoming Events</span><strong>{data.upcomingEvents.length}</strong></article></section>
    <section><h2>My Events</h2>{events.length === 0 ? <p>You haven't created any events yet. <Link to="/create-event">Create your first event.</Link></p> : <div className="organizer-events">{events.map(event => <article className="organizer-event" key={event._id}><div><h3>{event.title}</h3><p>{event.category} · {new Date(event.date).toLocaleDateString()} · {event.time} · {event.venue}</p><p>Registrations: {event.bookedBy?.length || 0} / {event.capacity}</p><span>{event.status || 'upcoming'}{event.registrationDeadline && new Date(event.registrationDeadline) < new Date() ? ' · Registration Closed' : ''}</span></div><div className="organizer-event-actions"><Link to={`/events/${event._id}`}>View</Link><Link to={`/update-event/${event._id}`}>Edit</Link><Link to={`/organizer/registrations?eventId=${event._id}`}>Registrations</Link></div></article>)}</div>}</section>
    <section><h2>Upcoming Events</h2>{data.upcomingEvents.length === 0 ? <p>No upcoming events.</p> : <div className="organizer-events">{data.upcomingEvents.map(event => <article className="organizer-event" key={`upcoming-${event._id}`}><div><h3>{event.title}</h3><p>{new Date(event.date).toLocaleDateString()} · {event.time} · {event.venue}</p><p>{event.bookedBy?.length || 0} / {event.capacity} registrations</p></div></article>)}</div>}</section>
  </main>;
}
