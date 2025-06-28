const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const UserRequest = require('../models/UserRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');

// Create a new user request to admin
router.post('/create', auth, async (req, res) => {
  try {
    const { adminId, title, description, estimatedDays } = req.body;
    
    // Check if admin exists and is verified
    const admin = await AdminProfile.findOne({ 
      _id: adminId, 
      status: 'verified' 
    }).populate('userId');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found or not verified' });
    }

    // Create the request
    const userRequest = new UserRequest({
      user: req.user.id,
      admin: adminId,
      title,
      description,
      timeline: {
        estimatedDays: parseInt(estimatedDays)
      }
    });

    await userRequest.save();

    // Create notification for the admin
    const notification = new Notification({
      recipient: admin.userId._id,
      sender: req.user.id,
      type: 'user_request',
      title: 'New Service Request',
      message: `${req.user.name} has requested your services: ${title}`,
      relatedUserRequest: userRequest._id
    });

    await notification.save();

    // Create notification for super admin
    const superAdmins = await User.find({ role: 'superadmin' });
    for (const superAdmin of superAdmins) {
      const superAdminNotification = new Notification({
        recipient: superAdmin._id,
        sender: req.user.id,
        type: 'user_request_created',
        title: 'New User Request Created',
        message: `${req.user.name} has requested services from ${admin.userId.name}`,
        relatedUserRequest: userRequest._id
      });
      await superAdminNotification.save();
    }

    res.status(201).json({ 
      message: 'Request created successfully', 
      request: userRequest 
    });

  } catch (error) {
    console.error('Error creating user request:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Get all requests for a user
router.get('/user-requests', auth, async (req, res) => {
  try {
    const requests = await UserRequest.find({ user: req.user.id })
      .populate('admin')
      .populate('admin.userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get all requests for an admin
router.get('/admin-requests', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const adminProfile = await AdminProfile.findOne({ userId: req.user.id });
    if (!adminProfile) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const requests = await UserRequest.find({ admin: adminProfile._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get all requests for super admin
router.get('/all-requests', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const requests = await UserRequest.find({})
      .populate('user', 'name email')
      .populate('admin')
      .populate('admin.userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Admin approves/rejects a request
router.put('/admin-response/:requestId', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, adminNotes, startDate, endDate } = req.body;
    const { requestId } = req.params;

    const adminProfile = await AdminProfile.findOne({ userId: req.user.id });
    if (!adminProfile) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const userRequest = await UserRequest.findOne({ 
      _id: requestId, 
      admin: adminProfile._id 
    }).populate('user');

    if (!userRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update request
    userRequest.status = status;
    userRequest.adminNotes = adminNotes;
    
    if (status === 'approved') {
      userRequest.timeline.startDate = startDate;
      userRequest.timeline.endDate = endDate;
    }

    await userRequest.save();

    // Create notification for user
    const notification = new Notification({
      recipient: userRequest.user._id,
      sender: req.user.id,
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
      message: status === 'approved' 
        ? `Your request "${userRequest.title}" has been approved by ${req.user.name}`
        : `Your request "${userRequest.title}" has been rejected by ${req.user.name}`,
      relatedUserRequest: userRequest._id
    });

    await notification.save();

    // Create notification for super admin
    const superAdmins = await User.find({ role: 'superadmin' });
    for (const superAdmin of superAdmins) {
      const superAdminNotification = new Notification({
        recipient: superAdmin._id,
        sender: req.user.id,
        type: 'request_status_updated',
        title: 'Request Status Updated',
        message: `${req.user.name} has ${status} a request from ${userRequest.user.name}`,
        relatedUserRequest: userRequest._id
      });
      await superAdminNotification.save();
    }

    res.json({ 
      message: `Request ${status} successfully`, 
      request: userRequest 
    });

  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

// Update request status (in_progress, completed)
router.put('/update-status/:requestId', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { requestId } = req.params;

    const adminProfile = await AdminProfile.findOne({ userId: req.user.id });
    if (!adminProfile) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    const userRequest = await UserRequest.findOne({ 
      _id: requestId, 
      admin: adminProfile._id 
    }).populate('user');

    if (!userRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    userRequest.status = status;
    if (adminNotes) {
      userRequest.adminNotes = adminNotes;
    }

    await userRequest.save();

    // Create notification for user
    const notification = new Notification({
      recipient: userRequest.user._id,
      sender: req.user.id,
      type: 'request_status_updated',
      title: 'Request Status Updated',
      message: `Your request "${userRequest.title}" status has been updated to ${status}`,
      relatedUserRequest: userRequest._id
    });

    await notification.save();

    res.json({ 
      message: 'Request status updated successfully', 
      request: userRequest 
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Error updating request status' });
  }
});

// Get single request details
router.get('/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const userRequest = await UserRequest.findById(requestId)
      .populate('user', 'name email')
      .populate('admin')
      .populate('admin.userId', 'name email');

    if (!userRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user has access to this request
    const isUser = req.user.role === 'user' && userRequest.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin' && userRequest.admin.userId._id.toString() === req.user.id;
    const isSuperAdmin = req.user.role === 'superadmin';

    if (!isUser && !isAdmin && !isSuperAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(userRequest);

  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({ message: 'Error fetching request details' });
  }
});

module.exports = router; 