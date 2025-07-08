# User Request System

## Overview
The User Request System allows users to request services from verified professionals (admins) with a complete workflow including approval, timeline management, and status tracking.

## Features

### 🔄 Complete Workflow
1. **User creates request** → Admin receives notification
2. **Admin approves/rejects** → User receives notification
3. **Admin sets timeline** → Work begins with start/end dates
4. **Status updates** → Progress tracking (pending → approved → in_progress → completed)
5. **Super Admin oversight** → Full visibility of all requests

### 📊 Request Statuses
- **Pending**: Initial state when user creates request
- **Approved**: Admin has approved the request and set timeline
- **Rejected**: Admin has rejected the request
- **In Progress**: Work has started
- **Completed**: Work has been finished

### 🔔 Notification System
- Real-time notifications for all request events
- Different notification types for different actions
- Automatic notification to super admins for oversight

## User Roles & Permissions

### 👤 Regular Users
- Create requests to verified professionals
- View their own requests
- Receive notifications about request status changes
- Access to request management page

### 👨‍💼 Admins (Professionals)
- Receive requests from users
- Approve/reject requests
- Set timeline (start/end dates)
- Update request status (in_progress, completed)
- Add notes and comments
- View all incoming requests

### 👑 Super Admins
- View all requests in the system
- Monitor request workflow
- Receive notifications for all request activities
- Access to comprehensive request management

## API Endpoints

### Create Request
```
POST /api/user-requests/create
```
**Body:**
```json
{
  "adminId": "admin_profile_id",
  "title": "Request Title",
  "description": "Detailed description",
  "estimatedDays": 7
}
```

### Get User Requests
```
GET /api/user-requests/user-requests
```

### Get Admin Requests
```
GET /api/user-requests/admin-requests
```

### Get All Requests (Super Admin)
```
GET /api/user-requests/all-requests
```

### Admin Response
```
PUT /api/user-requests/admin-response/:requestId
```
**Body:**
```json
{
  "status": "approved|rejected",
  "adminNotes": "Optional notes",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07"
}
```

### Update Request Status
```
PUT /api/user-requests/update-status/:requestId
```
**Body:**
```json
{
  "status": "in_progress|completed",
  "adminNotes": "Optional notes"
}
```

## Database Models

### UserRequest Model
```javascript
{
  user: ObjectId,           // Reference to User
  admin: ObjectId,          // Reference to AdminProfile
  title: String,            // Request title
  description: String,      // Request description
  status: String,           // pending|approved|rejected|in_progress|completed
  timeline: {
    estimatedDays: Number,  // User's estimate
    startDate: Date,        // Admin's start date
    endDate: Date          // Admin's end date
  },
  adminNotes: String,       // Admin's notes
  userNotes: String,        // User's notes
  createdAt: Date,
  updatedAt: Date
}
```

### Updated Notification Model
```javascript
{
  recipient: ObjectId,      // User receiving notification
  sender: ObjectId,         // User sending notification
  type: String,             // Notification type
  title: String,            // Notification title
  message: String,          // Notification message
  relatedAdminProfile: ObjectId,  // For admin verification
  relatedUserRequest: ObjectId,   // For user requests
  read: Boolean,
  createdAt: Date
}
```

## Components

### CreateRequestDialog
- Form for users to create requests
- Professional information display
- Timeline estimation
- Validation and error handling

### RequestManagement
- Comprehensive request management interface
- Different views for users, admins, and super admins
- Status filtering and sorting
- Request details and response dialogs

### AdminProfileDialog
- Updated to include "Request Services" button
- Only visible to authenticated users
- Integrates with CreateRequestDialog

## Navigation

### New Routes
- `/requests` - Request management page for all users

### Updated Navigation
- Navbar includes "My Requests" for authenticated users
- Super Admin Panel includes "All Requests" tab
- Notification system navigates to appropriate pages

## Usage Flow

### 1. User Creates Request
1. User searches for professionals
2. Clicks on professional profile
3. Clicks "Request Services" button
4. Fills out request form (title, description, timeline)
5. Submits request
6. Receives success message

### 2. Admin Responds
1. Admin receives notification
2. Views request in admin dashboard
3. Approves/rejects with notes
4. Sets timeline if approved
5. User receives notification

### 3. Work Progress
1. Admin updates status to "in_progress"
2. Work continues with timeline tracking
3. Admin marks as "completed"
4. User receives final notification

### 4. Super Admin Oversight
1. Super admin can view all requests
2. Monitor workflow and progress
3. Receive notifications for all activities
4. Ensure quality and compliance

## Notification Types

### For Users
- `user_request_created` - Request submitted successfully
- `request_approved` - Request approved by admin
- `request_rejected` - Request rejected by admin
- `request_status_updated` - Status changed (in_progress, completed)

### For Admins
- `user_request` - New request received
- `request_status_updated` - Status update notifications

### For Super Admins
- `user_request_created` - New request in system
- `request_status_updated` - All status changes
- `request_approved` - Request approved
- `request_rejected` - Request rejected

## Security Features

- Role-based access control
- Request ownership validation
- Admin verification required
- Secure API endpoints with authentication
- Input validation and sanitization

## Future Enhancements

- File attachments for requests
- Payment integration
- Rating and review system
- Automated reminders
- Advanced filtering and search
- Mobile app support
- Real-time chat integration

## Technical Implementation

### Frontend
- React with Material-UI components
- Redux for state management
- Axios for API communication
- Responsive design for all devices

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Socket.io for real-time features
- File upload handling

### Database
- MongoDB collections for users, admins, requests, notifications
- Proper indexing for performance
- Data validation and constraints
- Backup and recovery procedures 