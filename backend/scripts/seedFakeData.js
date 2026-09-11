require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../model/userSchema');
const Event = require('../model/eventSchema');
const Registration = require('../model/registrationSchema');

const fakeUsers = [
  { name: 'Demo Admin', email: 'admin.demo@example.com', phone: '9000000001', role: 'ADMIN' },
  { name: 'Demo Organizer', email: 'organizer.demo@example.com', phone: '9000000002', role: 'ORGANIZER' },
  { name: 'Demo Participant', email: 'participant.demo@example.com', phone: '9000000003', role: 'PARTICIPANT' },
  { name: 'Second Participant', email: 'participant.two@example.com', phone: '9000000004', role: 'PARTICIPANT' }
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in backend/.env');
  await mongoose.connect(process.env.MONGODB_URI);
  const password = await bcrypt.hash('Demo@12345', 10);
  const users = [];
  for (const data of fakeUsers) {
    const user = await User.findOneAndUpdate({ email: data.email }, { ...data, password }, { upsert: true, new: true, setDefaultsOnInsert: true });
    users.push(user);
    console.log(`User: ${user.email} (${user.role})`);
  }
  const organizer = users.find(user => user.role === 'ORGANIZER');
  const participants = users.filter(user => user.role === 'PARTICIPANT');
  const events = [
    { title: 'Demo Technology Conference', description: 'Sample technology event for testing.', category: 'conference', venue: 'Innovation Hall', date: new Date(Date.now() + 7 * 86400000), time: '10:00', registrationDeadline: new Date(Date.now() + 5 * 86400000), capacity: 100, price: 0 },
    { title: 'Demo Creative Workshop', description: 'Sample workshop for testing event registration.', category: 'workshop', venue: 'Studio Room 2', date: new Date(Date.now() + 14 * 86400000), time: '14:00', registrationDeadline: new Date(Date.now() + 12 * 86400000), capacity: 30, price: 25 }
  ];
  for (const data of events) {
    const event = await Event.findOneAndUpdate({ title: data.title, organizerId: organizer._id }, { ...data, createdBy: organizer._id, organizerId: organizer._id, status: 'upcoming' }, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`Event: ${event.title}`);
    for (const participant of participants) {
      await Registration.updateOne({ userId: participant._id, eventId: event._id }, { $setOnInsert: { userId: participant._id, eventId: event._id } }, { upsert: true });
      await Event.updateOne({ _id: event._id }, { $addToSet: { bookedBy: participant._id } });
      console.log(`  Registration: ${participant.email} -> ${event.title}`);
    }
  }
  await mongoose.disconnect();
  console.log('Fake data seeding completed. Demo password: Demo@12345');
}

seed().catch(async error => { console.error('Seed failed:', error.message); await mongoose.disconnect(); process.exitCode = 1; });
