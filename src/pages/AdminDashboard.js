import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Box, Chip, CircularProgress, Alert, Button, Grid } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fetchAdmin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/admin/profile');
      setAdmin(res.data);
    } catch (err) {
      console.error('Error loading profile:', err);
      if (err.response?.status === 403) {
        // User is not an admin, redirect to admin form
        navigate('/admin-form');
        return;
      }
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>Admin Dashboard</Typography>
        {admin ? (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Profile Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Name:</strong> {admin.name || 'N/A'}</Typography>
                  <Typography><strong>Email:</strong> {admin.email || 'N/A'}</Typography>
                  <Typography><strong>Profession:</strong> {admin.profession || 'N/A'}</Typography>
                  <Typography><strong>Experience:</strong> {admin.experience || 'N/A'}</Typography>
                  <Typography><strong>City:</strong> {admin.city || 'N/A'}</Typography>
                  <Typography><strong>Pincode:</strong> {admin.pincode || 'N/A'}</Typography>
                </Box>
                <Box mt={2} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    label={admin.verified ? '✅ Verified Admin' : '⏳ Pending Verification'}
                    color={admin.verified ? 'success' : 'warning'}
                    variant="outlined"
                  />
                  {!admin.verified && (
                    <Typography variant="body2" color="textSecondary">
                      Your application is under review by a super admin
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Identity Documents</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {admin.aadharCard ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Aadhar Card" size="small" color="primary" />
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => window.open(`/uploads/${admin.aadharCard}`, '_blank')}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No Aadhar Card uploaded
                    </Typography>
                  )}
                  
                  {admin.voterId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="Voter ID" size="small" color="secondary" />
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => window.open(`/uploads/${admin.voterId}`, '_blank')}
                      >
                        View Document
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No Voter ID uploaded
                    </Typography>
                  )}
                  
                  {!admin.aadharCard && !admin.voterId && (
                    <Typography variant="body2" color="error">
                      No identity documents uploaded
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </>
        ) : (
          <Alert severity="info">
            Unable to load admin profile. Please try again.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
