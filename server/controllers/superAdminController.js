// 📁 server/controllers/superAdminController.js
const AdminProfile = require('../models/AdminProfile');
const User = require('../models/User');

exports.getPendingAdmins = async (req, res) => {
  const pending = await AdminProfile.find({ status: 'pending' }).populate('userId');
  res.json(pending);
};

exports.verifyAdmin = async (req, res) => {
  try {
    console.log('SuperAdmin: Verifying admin with ID:', req.params.id);
    
    // First, get the admin profile to extract user data
    const adminProfile = await AdminProfile.findById(req.params.id).populate('userId');
    if (!adminProfile) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    // Update AdminProfile status to verified
    await AdminProfile.findByIdAndUpdate(req.params.id, { status: 'verified' });
    
    // Update User model with admin information and verified status
    await User.findByIdAndUpdate(adminProfile.userId._id, {
      profession: adminProfile.profession,
      experience: adminProfile.experience,
      city: adminProfile.city,
      pincode: adminProfile.pincode,
      verified: true,
      role: 'admin' // Ensure role is set to admin
    });

    console.log('Admin verification completed successfully');
    res.json({ message: 'Admin verified successfully' });
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({ message: 'Error verifying admin' });
  }
};

// 📁 server/controllers/userController.js
exports.getProfile = async (req, res) => {
  res.json({ message: 'User profile route working', user: req.user });
};
