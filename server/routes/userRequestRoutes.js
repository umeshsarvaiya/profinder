const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const UserRequest = require('../models/UserRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const { logActivity } = require('../utils/activityLogger');

// Create a new request (User only)
router.post('/create', auth, authorizeRoles('user'), async (req, res) => {
  try {
    const { adminId, title, description, estimatedDays } = req.body;

    // Validate required fields
    if (!adminId || !title || !description || !estimatedDays) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if admin exists and is verified
    const admin = await AdminProfile.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    if (admin.status !== 'verified') {
      return res.status(400).json({ message: 'Professional is not verified' });
    }

    // Create the request
    const request = new UserRequest({
      user: req.user.id,
      admin: adminId,
      title,
      description,
      timeline: { estimatedDays }
    });

    await request.save();

    // Log activity
    await logActivity({
      userId: req.user.id,
      actionType: 'request_created',
      description: `User created a new service request: "${title}"`,
      details: {
        requestTitle: title,
        adminName: admin.profession,
        userName: req.user.name,
        status: 'pending',
        timeline: { estimatedDays }
      },
      adminId: adminId,
      requestId: request._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Create notification for admin
    const adminUser = await User.findById(admin.userId);
    if (adminUser) {
      const notification = new Notification({
        recipient: adminUser._id,
        sender: req.user.id,
        type: 'user_request',
        title: 'New Service Request',
        message: `You have received a new service request: "${title}"`,
        relatedUserRequest: request._id
      });
      await notification.save();
    }

    // Create notification for super admins
    const superAdmins = await User.find({ role: 'superadmin' });
    for (const superAdmin of superAdmins) {
      const notification = new Notification({
        recipient: superAdmin._id,
        sender: req.user.id,
        type: 'user_request_created',
        title: 'New User Request Created',
        message: `A new service request has been created: "${title}"`,
        relatedUserRequest: request._id
      });
      await notification.save();
    }

    // Populate the request with user and admin details
    await request.populate('user', 'name email');
    await request.populate('admin', 'name profession city');

    res.status(201).json({ 
      message: 'Request created successfully',
      request 
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Get user's requests (User only)
router.get('/user-requests', auth, authorizeRoles('user'), async (req, res) => {
  try {
    const requests = await UserRequest.find({ user: req.user.id })
      .populate('admin', 'name profession city pincode')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get admin's requests (Admin only)
router.get('/admin-requests', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    // Find admin profile for the current user
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

// Get all requests (Super Admin only)
router.get('/all-requests', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const requests = await UserRequest.find()
      .populate('user', 'name email')
      .populate('admin', 'name profession city')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Admin response to request (approve/reject with timeline)
router.put('/admin-response/:requestId', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, adminNotes, startDate, endDate } = req.body;
    const { requestId } = req.params;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the request
    const request = await UserRequest.findById(requestId)
      .populate('user', 'name email')
      .populate('admin', 'name profession');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the admin owns this request
    const adminProfile = await AdminProfile.findOne({ userId: req.user.id });
    if (!adminProfile || request.admin._id.toString() !== adminProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    // Update request
    request.status = status;
    request.adminNotes = adminNotes;

    if (status === 'approved') {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required for approval' });
      }
      request.timeline.startDate = new Date(startDate);
      request.timeline.endDate = new Date(endDate);
    }

    await request.save();

    // Log activity
    await logActivity({
      userId: req.user.id,
      actionType: status === 'approved' ? 'request_approved' : 'request_rejected',
      description: `Admin ${status} request: "${request.title}"`,
      details: {
        requestTitle: request.title,
        adminName: request.admin.name,
        userName: request.user.name,
        status: status,
        notes: adminNotes,
        timeline: status === 'approved' ? {
          estimatedDays: request.timeline.estimatedDays,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        } : request.timeline
      },
      adminId: adminProfile._id,
      requestId: request._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Create notification for user
    const notification = new Notification({
      recipient: request.user._id,
      sender: req.user.id,
      type: status === 'approved' ? 'request_approved' : 'request_rejected',
      title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
      message: status === 'approved' 
        ? `Your request "${request.title}" has been approved. Work will start on ${new Date(startDate).toLocaleDateString()}`
        : `Your request "${request.title}" has been rejected. ${adminNotes || ''}`,
      relatedUserRequest: request._id
    });
    await notification.save();

    // Create notification for super admins
    const superAdmins = await User.find({ role: 'superadmin' });
    for (const superAdmin of superAdmins) {
      const notification = new Notification({
        recipient: superAdmin._id,
        sender: req.user.id,
        type: status === 'approved' ? 'request_approved' : 'request_rejected',
        title: status === 'approved' ? 'Request Approved' : 'Request Rejected',
        message: `Request "${request.title}" has been ${status} by ${request.admin.name}`,
        relatedUserRequest: request._id
      });
      await notification.save();
    }

    res.json({ 
      message: `Request ${status} successfully`,
      request 
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

// Update request status (Admin only - in_progress, completed)
router.put('/update-status/:requestId', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { requestId } = req.params;

    // Validate status
    if (!['in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the request
    const request = await UserRequest.findById(requestId)
      .populate('user', 'name email')
      .populate('admin', 'name profession');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if the admin owns this request
    const adminProfile = await AdminProfile.findOne({ userId: req.user.id });
    if (!adminProfile || request.admin._id.toString() !== adminProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Check if request is approved before allowing status updates
    if (request.status !== 'approved' && status === 'in_progress') {
      return res.status(400).json({ message: 'Request must be approved before starting work' });
    }

    // Update request
    request.status = status;
    if (adminNotes) {
      request.adminNotes = adminNotes;
    }

    await request.save();

    // Log activity
    await logActivity({
      userId: req.user.id,
      actionType: status === 'in_progress' ? 'request_in_progress' : 'request_completed',
      description: `Admin updated request status to ${status}: "${request.title}"`,
      details: {
        requestTitle: request.title,
        adminName: request.admin.name,
        userName: request.user.name,
        status: status,
        notes: adminNotes
      },
      adminId: adminProfile._id,
      requestId: request._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Create notification for user
    const statusMessage = status === 'in_progress' 
      ? 'Work has started on your request'
      : 'Work has been completed on your request';

    const notification = new Notification({
      recipient: request.user._id,
      sender: req.user.id,
      type: 'request_status_updated',
      title: status === 'in_progress' ? 'Work Started' : 'Work Completed',
      message: `${statusMessage}: "${request.title}"`,
      relatedUserRequest: request._id
    });
    await notification.save();

    // Create notification for super admins
    const superAdmins = await User.find({ role: 'superadmin' });
    for (const superAdmin of superAdmins) {
      const notification = new Notification({
        recipient: superAdmin._id,
        sender: req.user.id,
        type: 'request_status_updated',
        title: status === 'in_progress' ? 'Work Started' : 'Work Completed',
        message: `Request "${request.title}" status updated to ${status} by ${request.admin.name}`,
        relatedUserRequest: request._id
      });
      await notification.save();
    }

    res.json({ 
      message: `Request status updated to ${status}`,
      request 
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

    const request = await UserRequest.findById(requestId)
      .populate('user', 'name email')
      .populate('admin', 'name profession city pincode');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check authorization
    const adminProfile = await AdminProfile.findOne({ user: req.user.id });
    const isOwner = request.user._id.toString() === req.user.id;
    const isAdmin = adminProfile && request.admin._id.toString() === adminProfile._id.toString();
    const isSuperAdmin = req.user.role === 'superadmin';

    if (!isOwner && !isAdmin && !isSuperAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
});

module.exports = router; 