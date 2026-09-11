import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import { API_URL } from '../../api';

export default function AdminDashboard() {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const r = await axios.get(`${API_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }); setData(r.data); } catch (e) { setError(e.response?.data?.message || 'Unable to load admin dashboard'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <main className="admin-dashboard"><p>Loading dashboard...</p></main>;
  if (error) return <main className="admin-dashboard"><p className="admin-error">{error}</p><button onClick={load}>Retry</button></main>;
  return <main className="admin-dashboard"><div className="admin-heading"><h1>Admin Dashboard</h1><div><Link to="/admin/users">Users</Link> <Link to="/events">Events</Link></div></div><section className="admin-stats"><article><span>Total Users</span><strong>{data.totalUsers}</strong></article><article><span>Total Events</span><strong>{data.totalEvents}</strong></article><article><span>Total Registrations</span><strong>{data.totalRegistrations}</strong></article></section><section><h2>Recent Events</h2>{data.recentEvents.length ? <div className="admin-list">{data.recentEvents.map(event => <article key={event._id}><div><h3>{event.title}</h3><p>{event.category} · {new Date(event.date).toLocaleDateString()} · Organizer: {event.organizerId?.name || 'Unknown'}</p><p>Registrations: {event.bookedBy?.length || 0} / {event.capacity}</p></div><Link to={`/events/${event._id}`}>View</Link></article>)}</div> : <p>No events found.</p>}</section><section><h2>Recent Users</h2>{data.recentUsers.length ? <div className="admin-list">{data.recentUsers.map(user => <article key={user._id}><span>{user.name} · {user.email}</span><strong>{user.role}</strong></article>)}</div> : <p>No users found.</p>}</section></main>;
}
