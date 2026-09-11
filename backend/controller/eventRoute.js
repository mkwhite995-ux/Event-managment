const express = require('express');
const router = express.Router();
const Event = require('../model/eventSchema');
const Registration = require('../model/registrationSchema');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const canManageEvent = (req, event) => req.user.role === 'ADMIN' ||
    (req.user.role === 'ORGANIZER' && String(event.organizerId || event.createdBy) === String(req.user.userId));

// Get user's booked events (This route must come before the :id route)
router.get(['/user/booked-events', '/my-registrations'], authenticateToken, authorizeRoles('PARTICIPANT'), async (req, res) => {
    try {
        console.log('Fetching booked events for user:', req.user.userId);
        
        const events = await Event.find({
            bookedBy: req.user.userId
        }).sort({ date: 1 });

        console.log('Found booked events:', events.length);
        
        res.json({
            success: true,
            events: events
        });
    } catch (error) {
        console.error('Error fetching booked events:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching booked events' 
        });
    }
});

// Registration view: admins see all; organizers see registrations for their own events.
router.get('/registrations', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), async (req, res) => {
    try {
        const filter = req.user.role === 'ADMIN' ? {} : { organizerId: req.user.userId };
        const events = await Event.find(filter).populate('bookedBy', '-password').sort({ date: 1 });
        res.json({ success: true, registrations: events });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

router.get('/organizer/dashboard', authenticateToken, authorizeRoles('ORGANIZER'), async (req, res) => {
    try {
        const myEvents = await Event.find({ organizerId: req.user.userId }).sort({ date: 1 });
        const now = new Date();
        const upcomingEvents = myEvents.filter(event => new Date(event.date) >= now && event.status !== 'cancelled' && event.status !== 'completed');
        const totalRegistrations = myEvents.reduce((total, event) => total + (event.bookedBy?.length || 0), 0);
        res.json({ success: true, totalEvents: myEvents.length, totalRegistrations, upcomingEvents, myEvents });
    } catch (error) {
        console.error('Organizer dashboard error:', error);
        res.status(500).json({ message: 'Unable to load organizer dashboard' });
    }
});

// Get all events (Public)
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Get single event details
router.get('/events/:id', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching event with ID:', req.params.id);
        
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            console.log('Event not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log('Found event:', event);
        res.json(event);
    } catch (error) {
        console.error('Error fetching event details:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }
        res.status(500).json({ message: 'Error fetching event details' });
    }
});

// Create event (Admin only)
router.post('/events', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), async (req, res) => {
    try {
        console.log('Creating event with data:', req.body);
        
        const eventData = {
            ...req.body,
            createdBy: req.user.userId,
            organizerId: req.user.userId
        };
        delete eventData.role;

        const event = new Event(eventData);
        const savedEvent = await event.save();

        console.log('Event created:', savedEvent);

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: savedEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating event' });
    }
});

// Update event (Admin only)
router.put('/events/:id', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), async (req, res) => {
    try {
        console.log('Updating event:', req.params.id, 'with data:', req.body);
        
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (!canManageEvent(req, event)) return res.status(403).json({ message: 'You can only manage your own events' });

        // Update fields
        const updates = { ...req.body };
        delete updates.createdBy;
        delete updates.organizerId;
        delete updates.bookedBy;
        Object.assign(event, updates);
        
        // Save updated event
        const updatedEvent = await event.save();
        
        console.log('Event updated successfully:', updatedEvent);
        
        res.json({
            success: true,
            message: 'Event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }
        res.status(500).json({ message: 'Error updating event' });
    }
});

// Book event
router.post(['/events/:id/book', '/events/:id/register'], authenticateToken, authorizeRoles('PARTICIPANT'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const existingRegistration = await Registration.findOne({ userId: req.user.userId, eventId: event._id });
        if (existingRegistration || event.bookedBy.some(id => id.toString() === req.user.userId)) {
            return res.status(409).json({ message: 'You are already registered for this event.' });
        }

        if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
            return res.status(400).json({ message: 'Registration deadline has passed' });
        }

        if (event.bookedBy.length >= event.capacity) {
            return res.status(400).json({ message: 'Event is fully booked' });
        }

        try {
            await Registration.create({ userId: req.user.userId, eventId: event._id });
        } catch (registrationError) {
            if (registrationError.code === 11000) return res.status(409).json({ message: 'You are already registered for this event.' });
            throw registrationError;
        }
        await Event.updateOne({ _id: event._id }, { $addToSet: { bookedBy: req.user.userId } });
        event.bookedBy.push(req.user.userId);

        res.json({
            success: true,
            message: 'Event booked successfully',
            availableSpots: event.capacity - event.bookedBy.length
        });
    } catch (error) {
        console.error('Error booking event:', error);
        res.status(500).json({ message: 'Error booking event' });
    }
});

// Cancel booking
router.delete(['/events/:id/book', '/events/:id/register'], authenticateToken, authorizeRoles('PARTICIPANT'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.bookedBy.some(id => id.toString() === req.user.userId)) {
            return res.status(400).json({ message: 'You have not booked this event' });
        }

        await Registration.deleteOne({ userId: req.user.userId, eventId: event._id });
        event.bookedBy = event.bookedBy.filter(id => id.toString() !== req.user.userId);
        await event.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            availableSpots: event.capacity - event.bookedBy.length
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Error cancelling booking' });
    }
});

// Delete event (Admin only)
router.delete('/events/:id', authenticateToken, authorizeRoles('ADMIN', 'ORGANIZER'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (!canManageEvent(req, event)) return res.status(403).json({ message: 'You can only manage your own events' });

        await event.deleteOne();
        await Registration.deleteMany({ eventId: event._id });
        res.json({ 
            success: true,
            message: 'Event deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

module.exports = router;
