import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';

export default function OrganizerRegistrations() {
  const [events, setEvents] = useState([]);
  useEffect(() => { axios.get(`${API_URL}/registrations`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => setEvents(r.data.registrations || [])); }, []);
  return <main className="organizer-dashboard"><h1>Event Registrations</h1>{events.length === 0 ? <p>No registrations yet.</p> : events.map(event => <section className="organizer-event" key={event._id}><div><h2>{event.title}</h2>{(event.bookedBy || []).map(user => <p key={user._id || user}>{user.name || 'Participant'} {user.email ? `(${user.email})` : ''}</p>)}</div></section>)}</main>;
}
