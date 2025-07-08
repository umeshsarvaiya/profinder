import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  VerifiedUser as VerifiedIcon,
  PendingActions as PendingIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from '../../api/axios';

// Chart components (we'll use a simple bar chart with CSS for now)
const StatCard = ({ title, value, icon, color, onClick, loading }) => (
  <Card 
    sx={{ 
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      },
      background: `linear-gradient(135deg, ${color}15, ${color}25)`,
      border: `1px solid ${color}30`
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
            {loading ? '...' : value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {title}
          </Typography>
        </Box>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: '50%', 
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Simple Bar Chart Component
const SimpleBarChart = ({ data, labels, colors }) => (
  <Box sx={{ mt: 3, p: 2 }}>
    <Typography variant="h6" gutterBottom>
      Statistics Overview
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: 200, mt: 2 }}>
      {data.map((value, index) => (
        <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: '80%',
              height: `${(value / Math.max(...data)) * 150}px`,
              backgroundColor: colors[index],
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            {value}
          </Box>
          <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', fontSize: '0.7rem' }}>
            {labels[index]}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

// Detail Dialog Component
const DetailDialog = ({ open, onClose, title, data, type }) => {
  const getStatusChip = (status) => {
    const statusConfig = {
      verified: { color: 'success', label: 'Verified' },
      pending: { color: 'warning', label: 'Pending' },
      rejected: { color: 'error', label: 'Rejected' }
    };
    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {title}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {data.map((item, index) => (
            <ListItem key={index} divider>
              <ListItemAvatar>
                <Avatar>
                  {item.name ? item.name.charAt(0).toUpperCase() : 
                   item.userId?.name ? item.userId.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  type === 'users' ? item.name :
                  item.userId?.name || 'Unknown User'
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {type === 'users' ? item.email :
                       `${item.profession || 'N/A'} • ${item.city || 'N/A'}`}
                    </Typography>
                    {type !== 'users' && item.status && (
                      <Box sx={{ mt: 1 }}>
                        {getStatusChip(item.status)}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    verifiedAdmins: 0,
    pendingAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ title: '', data: [], type: '' });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/superadmin/dashboard-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (type) => {
    try {
      let endpoint = '';
      let title = '';
      
      switch (type) {
        case 'users':
          endpoint = '/api/superadmin/users';
          title = 'All Users';
          break;
        case 'admins':
          endpoint = '/api/superadmin/admins';
          title = 'All Admins';
          break;
        case 'verified':
          endpoint = '/api/superadmin/verified-admins';
          title = 'Verified Admins';
          break;
        case 'pending':
          endpoint = '/api/superadmin/pending';
          title = 'Pending Admin Requests';
          break;
        default:
          return;
      }

      const response = await axios.get(endpoint);
      setDialogData({
        title,
        data: response.data,
        type
      });
      setDialogOpen(true);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    }
  };

  const chartData = [stats.totalUsers, stats.totalAdmins, stats.verifiedAdmins, stats.pendingAdmins];
  const chartLabels = ['Users', 'Admins', 'Verified', 'Pending'];
  const chartColors = ['#2196F3', '#FF9800', '#4CAF50', '#F44336'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Super Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon sx={{ color: '#2196F3' }} />}
            color="#2196F3"
            onClick={() => handleCardClick('users')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Admins"
            value={stats.totalAdmins}
            icon={<AdminIcon sx={{ color: '#FF9800' }} />}
            color="#FF9800"
            onClick={() => handleCardClick('admins')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Admins"
            value={stats.verifiedAdmins}
            icon={<VerifiedIcon sx={{ color: '#4CAF50' }} />}
            color="#4CAF50"
            onClick={() => handleCardClick('verified')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Requests"
            value={stats.pendingAdmins}
            icon={<PendingIcon sx={{ color: '#F44336' }} />}
            color="#F44336"
            onClick={() => handleCardClick('pending')}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <SimpleBarChart 
          data={chartData}
          labels={chartLabels}
          colors={chartColors}
        />
      </Paper>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={() => handleCardClick('pending')}
              sx={{ borderColor: '#F44336', color: '#F44336' }}
            >
              Review Pending Requests
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<ViewIcon />}
              onClick={() => handleCardClick('verified')}
              sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
            >
              View Verified Admins
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Detail Dialog */}
      <DetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogData.title}
        data={dialogData.data}
        type={dialogData.type}
      />
    </Box>
  );
};

export default SuperAdminDashboard;
