const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const AdminProfile = require('../models/AdminProfile');
const User = require('../models/User');

// Debug route to check all admin profiles
router.get('/debug/all-profiles', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    console.log('SuperAdmin: Debug - Fetching all admin profiles...');
    
    const allProfiles = await AdminProfile.find({}).populate('userId');
    console.log('All admin profiles:', allProfiles);
    
    res.json({
      totalProfiles: allProfiles.length,
      profiles: allProfiles
    });
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    res.status(500).json({ message: 'Error fetching all profiles' });
  }
});

router.get('/pending', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    console.log('SuperAdmin: Fetching pending admins...');
    console.log('User making request:', req.user);
    
    const pending = await AdminProfile.find({ status: 'pending' }).populate('userId');
    console.log('Found pending admins:', pending.length);
    console.log('Pending admins data:', pending);
    
    res.json(pending);
  } catch (error) {
    console.error('Error fetching pending admins:', error);
    res.status(500).json({ message: 'Error fetching pending admins' });
  }
});

router.post('/verify/:id', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    console.log('SuperAdmin: Verifying admin with ID:', req.params.id);
    
    const result = await AdminProfile.findByIdAndUpdate(req.params.id, { status: 'verified' });
    console.log('Verification result:', result);
    
    res.json({ message: 'Admin verified' });
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ message: 'Error verifying admin' });
  }
});

router.post('/reject/:id', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    console.log('SuperAdmin: Rejecting admin with ID:', req.params.id);
    
    const result = await AdminProfile.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    console.log('Rejection result:', result);
    
    res.json({ message: 'Admin request rejected' });
  } catch (error) {
    console.error('Error rejecting admin:', error);
    res.status(500).json({ message: 'Error rejecting admin' });
  }
});

// Dashboard statistics endpoint
router.get('/dashboard-stats', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    console.log('SuperAdmin: Fetching dashboard statistics...');
    
    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total admins (all admin profiles)
    const totalAdmins = await AdminProfile.countDocuments();
    
    // Get verified admins
    const verifiedAdmins = await AdminProfile.countDocuments({ status: 'verified' });
    
    // Get pending admin requests
    const pendingAdmins = await AdminProfile.countDocuments({ status: 'pending' });
    
    const stats = {
      totalUsers,
      totalAdmins,
      verifiedAdmins,
      pendingAdmins
    };
    
    console.log('Dashboard stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get all users for detailed view
router.get('/users', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all admins for detailed view
router.get('/admins', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const admins = await AdminProfile.find({}).populate('userId', '-password');
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'Error fetching admins' });
  }
});

// Get verified admins for detailed view
router.get('/verified-admins', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const verifiedAdmins = await AdminProfile.find({ status: 'verified' }).populate('userId', '-password');
    res.json(verifiedAdmins);
  } catch (error) {
    console.error('Error fetching verified admins:', error);
    res.status(500).json({ message: 'Error fetching verified admins' });
  }
});

module.exports = router;
