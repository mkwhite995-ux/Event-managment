const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/userSchema');
const Event = require('../model/eventSchema');
const Registration = require('../model/registrationSchema');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const authorizeAdmin = authorizeRoles('ADMIN');


// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('Updating profile for user:', req.user.userId);
        console.log('Update data:', req.body);

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle password change if requested
        if (req.body.currentPassword && req.body.newPassword) {
            const isValidPassword = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
            user.password = hashedPassword;
        }

        // Update user fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;

        const updatedUser = await user.save();

        // Create response without password
        const userResponse = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'Email already exists' 
            });
        }

        res.status(500).json({ 
            message: 'Error updating profile',
            error: error.message 
        });
    }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Admin-only user data used by the booking and user-management screens.
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

router.patch('/:id/role', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['ORGANIZER', 'PARTICIPANT'].includes(role)) {
            return res.status(400).json({ message: 'Role must be ORGANIZER or PARTICIPANT' });
        }
        if (req.params.id === req.user.userId) return res.status(400).json({ message: 'You cannot change your own administrator role' });
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.name === 'CastError' ? 'Invalid user ID format' : 'Error updating role' });
    }
});

router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Event.updateMany({ bookedBy: user._id }, { $pull: { bookedBy: user._id } });
        await Registration.deleteMany({ userId: user._id });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
