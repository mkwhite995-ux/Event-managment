/*
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @                                                                                @
 @                    EVENT MANAGEMENT SYSTEM - BACKEND                           @
 @                                                                               @
 @     Copyright (c) 2024-2025 Rahul Sahani. All Rights Reserved.               @
 @                                                                               @
 @     This software is the confidential and proprietary information of         @
 @     Rahul Sahani. You shall not disclose such confidential information       @
 @     and shall use it only in accordance with the terms of the license        @
 @     agreement you entered into with Rahul Sahani.                            @
 @                                                                              @
 @     WARNING: This software is protected by copyright law and international   @
 @     treaties. Unauthorized reproduction, distribution, or modification of     @
 @     this software, or any portion of it, may result in severe civil and     @
 @     criminal penalties, and will be prosecuted to the maximum extent         @
 @     possible under law.                                                      @
 @                                                                              @
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

// Security hash (DO NOT REMOVE): 0xf7eb8c3d94a5d6e2



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('./model/userSchema');
const Feedback = require('./model/feedbackSchema');
const Event = require('./model/eventSchema');
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');

require('dotenv').config();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
mongoose.set('strictQuery', true);

const app = express();

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({ origin: (origin, callback) => {
    // Allow configured origins plus Vercel preview/production deployments.
    // Requests without an Origin header (health checks/server-to-server) remain allowed.
    const isVercelOrigin = Boolean(origin && /^https:\/\/[^/]+\.vercel\.app$/.test(origin));
    if (!origin || allowedOrigins.includes(origin) || isVercelOrigin) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
} }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    // console.log('Headers:', {
    //     ...req.headers,
    //     authorization: req.headers.authorization ? '***' : undefined
    // });
    if (['POST', 'PUT'].includes(req.method)) {
        console.log('Body:', req.body);
    }
    next();
});

// MongoDB Connection
// Keep the HTTP server available for health checks, but give a clear error when
// the local environment has not been configured yet.
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing. Create backend/.env from backend/.env.example.');
} else {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.error('MongoDB connection error:', err.message));
}

app.get('/health', (req, res) => {
    res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
        status: mongoose.connection.readyState === 1 ? 'ok' : 'database-unavailable'
    });
});

// Avoid Mongoose buffering requests for a long time when the database is not
// connected; the frontend receives a useful response immediately instead.
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database is unavailable. Check MONGODB_URI in backend/.env.'
        });
    }
    next();
});

// Auth Routes
app.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Name, email, phone, and password are required' });
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new UserModel({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'PARTICIPANT'
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server authentication is not configured' });
        }

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const role = user.role === 'admin' ? 'ADMIN' : user.role === 'user' ? 'PARTICIPANT' : user.role;
        if (!['ADMIN', 'ORGANIZER', 'PARTICIPANT'].includes(role)) {
            return res.status(403).json({ message: 'User account has an invalid role' });
        }
        const token = jwt.sign(
            { userId: user._id, role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role
        };

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Import routes
const eventRoutes = require('./controller/eventRoute');
const userRoutes = require('./controller/userController');

// Apply routes with path prefix
app.use('/', eventRoutes);
app.use('/user', userRoutes);

app.get('/admin/dashboard', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const [totalUsers, totalEvents, registrationTotals, recentEvents, recentUsers] = await Promise.all([
            UserModel.countDocuments(), Event.countDocuments(), Event.aggregate([{ $project: { count: { $size: { $ifNull: ['$bookedBy', []] } } } }, { $group: { _id: null, total: { $sum: '$count' } } }]),
            Event.find().populate('organizerId', 'name email').sort({ createdAt: -1 }).limit(10),
            UserModel.find().select('-password').sort({ createdAt: -1 }).limit(10)
        ]);
        res.json({ success: true, totalUsers, totalEvents, totalRegistrations: registrationTotals[0]?.total || 0, recentEvents, recentUsers });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Unable to load admin dashboard' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    if (err.name === 'CastError') {
        return res.status(400).json({ 
            message: 'Invalid ID format',
            details: err.message
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation Error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
});

app.post('/feedback', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }

        await Feedback.create({ name: name.trim(), email: email.trim().toLowerCase(), message: message.trim() });
        res.status(201).json({ success: true, message: 'Thank you for your feedback!' });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ message: 'Unable to submit feedback' });
    }
});
