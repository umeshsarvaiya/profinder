// 📁 server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { uploadMultiple } = require('../middleware/upload');

const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const Notification = require('../models/Notification');
const adminController = require('../controllers/adminController');

router.post('/submit', auth, uploadMultiple, async (req, res) => {
  try {
    const { profession, experience, city, pincode } = req.body;

    if (!profession || !experience || !city || !pincode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if admin profile already exists
    const existingProfile = await AdminProfile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Admin profile already submitted' });
    }

    // Get uploaded files
    const aadharCard = req.files.aadharCard ? req.files.aadharCard[0].filename : null;
    const voterId = req.files.voterId ? req.files.voterId[0].filename : null;

    // Validate that at least one identity document is uploaded
    if (!aadharCard && !voterId) {
      return res.status(400).json({ message: 'Please upload at least one identity document (Aadhar Card or Voter ID)' });
    }

    // Update user role to admin (pending verification)
    await User.findByIdAndUpdate(req.user.id, { 
      role: 'admin',
      aadharCard,
      voterId
    });

    // Create new admin profile
    const adminProfile = new AdminProfile({
      userId: req.user.id,
      profession,
      experience,
      city,
      pincode,
      aadharCard,
      voterId,
      status: 'pending'
    });

    await adminProfile.save();

    // Create notification for all super admins
    const superAdmins = await User.find({ role: 'superadmin' });
    
    for (const superAdmin of superAdmins) {
      const notification = new Notification({
        recipient: superAdmin._id,
        sender: req.user.id,
        type: 'admin_verification_request',
        title: 'New Admin Verification Request',
        message: `${user.name} has submitted an admin verification request for ${profession} profession.`,
        relatedAdminProfile: adminProfile._id
      });
      
      await notification.save();
    }

    // Send real-time notification via socket.io
    if (global.io) {
      global.io.to('superadmin').emit('new-admin-verification', {
        message: `${user.name} has submitted an admin verification request`,
        adminProfile: adminProfile._id
      });
    }

    res.json({ message: 'Admin profile submitted and pending verification' });

  } catch (error) {
    console.error('Admin profile submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get All Verified Admins
router.get('/verified', async (req, res) => {
  try {
    const admins = await AdminProfile.find({ status: 'verified' }).populate('userId');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all admin profiles (super admin only)
router.get('/all-profiles', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const admins = await AdminProfile.find({}).populate('userId');
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admin profiles:', error);
    res.status(500).json({ message: 'Error fetching admin profiles' });
  }
});

// Enhanced search route with flexible filtering
router.get('/search', async (req, res) => {
  try {
    const { city, profession, searchTerm, experience } = req.query;
    
    // Build search query
    let query = { status: 'verified' };
    
    // Add filters if provided
    if (city) {
      query.city = { $regex: city, $options: 'i' }; // Case-insensitive partial match
    }
    
    if (profession) {
      query.profession = { $regex: profession, $options: 'i' }; // Case-insensitive partial match
    }
    
    if (experience) {
      query.experience = { $gte: parseInt(experience) }; // Minimum experience years
    }
    
    // If searchTerm is provided, search across multiple fields
    if (searchTerm) {
      const admins = await AdminProfile.find(query).populate('userId');
      
      // Filter by search term across name, profession, and city
      const filteredAdmins = admins.filter(admin => {
        const name = admin.userId?.name || '';
        const profession = admin.profession || '';
        const city = admin.city || '';
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
               city.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      return res.json(filteredAdmins);
    }
    
    // If no searchTerm, just use the query filters
    const admins = await AdminProfile.find(query).populate('userId');
    res.json(admins);
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available professions and cities for filters
router.get('/filter-options', async (req, res) => {
  try {
    const verifiedAdmins = await AdminProfile.find({ status: 'verified' });
    
    // Extract unique professions and cities
    const professions = [...new Set(verifiedAdmins.map(admin => admin.profession))].filter(Boolean);
    const cities = [...new Set(verifiedAdmins.map(admin => admin.city))].filter(Boolean);
    
    res.json({
      professions: professions.sort(),
      cities: cities.sort()
    });
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// New routes for admin profile management
router.put('/profile', auth, adminController.updateAdminProfile);
router.get('/profile', auth, adminController.getAdminProfile);

module.exports = router;