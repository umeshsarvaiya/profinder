// 📁 client/src/pages/SuperAdminPanel.jsx
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button, 
  Container, 
  CardActions, 
  Alert, 
  Box, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Visibility, 
  Verified, 
  Close, 
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Cancel,
  Assignment as RequestIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import axios from '../api/axios';
import SuperAdminDashboard from '../components/SuperAdminDashboard';
import RequestManagement from '../components/RequestManagement';
import { useNotifications } from '../hooks/useNotifications';

const SuperAdminPanel = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminToReject, setAdminToReject] = useState(null);
  const location = useLocation();
  const { fetchNotifications } = useNotifications();

  // Handle activeTab from navigation state
  useEffect(() => {
    if (location.state?.activeTab !== undefined) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching pending admins...');
      const res = await axios.get('/api/superadmin/pending');
      console.log('Pending admins response:', res.data);
      setPendingAdmins(res.data);
    } catch (err) {
      console.error('Error fetching pending admins:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending admins');
    } finally {
      setLoading(false);
    }
  };

  const verifyAdmin = async (id) => {
    try {
      await axios.post(`/api/superadmin/verify/${id}`);
      fetchAdmins(); // Refresh the list
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error('Error verifying admin:', err);
      setError(err.response?.data?.message || 'Failed to verify admin');
    }
  };

  const rejectAdmin = async (id) => {
    try {
      await axios.post(`/api/superadmin/reject/${id}`);
      fetchAdmins(); // Refresh the list
      fetchNotifications(); // Refresh notifications
      setRejectDialogOpen(false);
      setAdminToReject(null);
    } catch (err) {
      console.error('Error rejecting admin:', err);
      setError(err.response?.data?.message || 'Failed to reject admin');
    }
  };

  const handleRejectConfirm = () => {
    if (adminToReject) {
      rejectAdmin(adminToReject);
    }
  };

  const handleRejectCancel = () => {
    setRejectDialogOpen(false);
    setAdminToReject(null);
  };

  const handleViewImage = (imagePath, documentType) => {
    console.log('Opening image:', { imagePath, documentType });
    const fullImageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${imagePath}`;
    console.log('Full image URL:', fullImageUrl);
    setSelectedImage({ path: imagePath, type: documentType });
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (activeTab === 1) {
      fetchAdmins();
    }
  }, [activeTab]);

  const PendingAdminsList = () => {
    if (loading) {
      return (
        <Container sx={{ mt: 4 }}>
          <Typography variant="h6">Loading pending admins...</Typography>
        </Container>
      );
    }

    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>Pending Admins for Verification</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {pendingAdmins.length === 0 ? (
          <Typography variant="h6" color="textSecondary">
            No pending admins found
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Profession</strong></TableCell>
                  <TableCell><strong>Experience</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Identity Documents</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingAdmins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>
                      <Typography variant="body1">
                        {admin.userId?.name || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {admin.profession}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {admin.experience}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {admin.city}, {admin.pincode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {admin.aadharCard && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Aadhar Card" size="small" color="primary" />
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewImage(admin.aadharCard, 'Aadhar Card')}
                            >
                              View
                            </Button>
                          </Box>
                        )}
                        
                        {admin.voterId && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Voter ID" size="small" color="secondary" />
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewImage(admin.voterId, 'Voter ID')}
                            >
                              View
                            </Button>
                          </Box>
                        )}
                        
                        {!admin.aadharCard && !admin.voterId && (
                          <Typography variant="body2" color="error">
                            No documents uploaded
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          color="success"
                          startIcon={<Verified />}
                          onClick={() => verifyAdmin(admin._id)}
                          size="small"
                        >
                          Verify
                        </Button>
                        <Button 
                          variant="contained" 
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => {
                            setRejectDialogOpen(true);
                            setAdminToReject(admin._id);
                          }}
                          size="small"
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Image View Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={handleCloseImageDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedImage?.type} Document
              </Typography>
              <IconButton onClick={handleCloseImageDialog}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedImage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <img
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${selectedImage.path}`}
                  alt={selectedImage.type}
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="error" 
                  sx={{ display: 'none', textAlign: 'center', mt: 2 }}
                >
                  Failed to load image. Please check the file path.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseImageDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="super admin tabs">
          <Tab 
            icon={<DashboardIcon />} 
            label="Dashboard" 
            iconPosition="start"
          />
          <Tab 
            icon={<AdminIcon />} 
            label="Pending Admins" 
            iconPosition="start"
          />
          <Tab 
            icon={<RequestIcon />} 
            label="All Requests" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 0 && <SuperAdminDashboard />}
      {activeTab === 1 && <PendingAdminsList />}
      {activeTab === 2 && <RequestManagement />}

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleRejectCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Confirm Rejection</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to reject this admin request? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdminPanel;
