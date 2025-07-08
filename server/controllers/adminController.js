const AdminProfile = require("../models/AdminProfile");
const User = require("../models/User");

exports.submitAdminForm = async (req, res) => {
  try {
    const { profession, experience, city, pincode, mobile, email, latitude, longitude } = req.body;
  
    // Get uploaded files
    const aadharCard = req.files.aadharCard ? req.files.aadharCard[0].filename : null;
    const voterId = req.files.voterId ? req.files.voterId[0].filename : null;
    // Validate that at least one identity document is uploaded
    if (!aadharCard && !voterId) {
      return res.status(400).json({ message: 'Please upload at least one identity document (Aadhar Card or Voter ID)' });
    }
    const admin = new AdminProfile({
      userId: req.user.id,
      profession,
      experience,
      city,
      pincode,
      mobile,
      email,
      latitude,
      longitude,
      aadharCard,
      voterId
    });
    await admin.save();
    res.json({ message: 'Admin profile submitted successfully' });
  } catch (error) {
    console.error('Submit admin form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVerifiedAdmins = async (req, res) => {
  const { city, profession } = req.query;
  const admins = await AdminProfile.find({ city, profession, status: 'verified' }).populate('userId');
  res.json(admins);
};

// New function to update admin profile in User model
exports.updateAdminProfile = async (req, res) => {
  try {
    const { profession, experience, city, pincode, mobile, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!profession || !experience || !city || !pincode || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists and is an admin
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update profile' });
    }

    // Update user profile with admin information
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        profession,
        experience,
        city,
        pincode,
        mobile,
        latitude,
        longitude,
        verified: false // Reset verification status when profile is updated
      },
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Admin profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profession: updatedUser.profession,
        experience: updatedUser.experience,
        city: updatedUser.city,
        pincode: updatedUser.pincode,
        mobile: updatedUser.mobile,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        verified: updatedUser.verified
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access profile' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      experience: user.experience,
      city: user.city,
      pincode: user.pincode,
      mobile: user.mobile,
      latitude: user.latitude,
      longitude: user.longitude,
      verified: user.verified,
      aadharCard: user.aadharCard,
      voterId: user.voterId
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
