import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Badge,
  IconButton,
  Box,
  CircularProgress,
  Divider
} from '@mui/material';
import { Notifications as NotificationsIcon, CheckCircle, Error, Info, Work, DoneAll } from '@mui/icons-material';
import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const typeIcon = {
  user_request: <Work color="primary" />, // New request for admin
  user_request_created: <Info color="info" />, // New request in system
  request_approved: <CheckCircle color="success" />,
  request_rejected: <Error color="error" />,
  request_status_updated: <DoneAll color="primary" />,
};

const NotificationList = ({ onNotificationRead }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError('');
        let res;
        if (user?.role === 'admin') {
          res = await axios.get('/api/notification');
        } else if (user?.role === 'user' || user?.role === 'superadmin') {
          res = await axios.get('/api/notification');
        }
        setNotifications(res?.data || []);
        setUnreadCount((res?.data || []).filter(n => !n.read).length);
      } catch (err) {
        setError('Failed to fetch notifications.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await axios.patch(`/api/notification/${notification._id}/read`);
        setNotifications((prev) => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        // Call parent callback to update navbar count
        if (onNotificationRead) {
          onNotificationRead();
        }
      } catch {}
    }
    
    // Navigate to related request if available
    if (notification.relatedUserRequest) {
      navigate(`/requests`);
      // Close the popover if it's open (for navbar notifications)
      if (onNotificationRead) {
        // This indicates it's in a popover, so close it
        setTimeout(() => {
          // You can add a callback to close the popover here if needed
        }, 100);
      }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
        <Typography variant="h6" sx={{ ml: 1 }}>Notifications</Typography>
      </Box>
      <List>
        {notifications.length === 0 && (
          <ListItem>
            <ListItemText 
              primary="No notifications yet" 
              secondary="You'll see notifications here when there are updates about your requests or account."
            />
          </ListItem>
        )}
        {notifications.map((n) => (
          <React.Fragment key={n._id}>
            <ListItem
              button
              onClick={() => handleNotificationClick(n)}
              selected={!n.read}
              sx={{ bgcolor: !n.read ? 'grey.100' : undefined }}
            >
              <ListItemIcon>
                {typeIcon[n.type] || <Info color="info" />}
              </ListItemIcon>
              <ListItemText
                primary={n.title}
                secondary={
                  <>
                    <Typography variant="body2">{n.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default NotificationList; 