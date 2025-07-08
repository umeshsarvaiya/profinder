import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Paper,
  Stack,
  Rating,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import CreateRequestDialog from './CreateRequestDialog';
import SuccessMessage from './SuccessMessage';
import { useAuth } from '../hooks/useAuth';

const AdminProfileDialog = ({ open, onClose, admin, loading }) => {
  const { user } = useAuth();
  const [createRequestOpen, setCreateRequestOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleContactProfessional = () => {
    if (user.role === 'user') {
      setCreateRequestOpen(true);
    } else {
      // For non-users, you might want to show contact info or redirect to login
      onClose();
    }
  };

  const handleRequestCreated = (request) => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Dialog>
    );
  }

  if (!admin) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header with gradient background */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: -30, right: -30, opacity: 0.1 }}>
            <WorkIcon sx={{ fontSize: 120 }} />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                {admin.name?.charAt(0)?.toUpperCase() || 'P'}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {admin.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  {admin.profession}
                </Typography>
                <Chip 
                  label="✅ Verified Professional" 
                  size="medium"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'medium'
                  }}
                />
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Key Information Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                    Professional Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ color: 'primary.main', mr: 2, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Profession</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {admin.profession}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon sx={{ color: 'primary.main', mr: 2, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Experience</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {admin.experience} years
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: 'warning.main', mr: 2, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Rating</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={4.5} readOnly size="small" sx={{ mr: 1 }} />
                          <Typography variant="body1" fontWeight="medium">4.5/5</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                    Location & Contact
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ color: 'primary.main', mr: 2, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Location</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {admin.city}, {admin.pincode}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ color: 'primary.main', mr: 2, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {admin.email || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ color: 'primary.main', mr: 2, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Phone</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {admin.phone || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Additional Information */}
            {admin.bio && (
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                  About
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {admin.bio}
                </Typography>
              </Paper>
            )}
            {/* Services or Specializations */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                Services & Specializations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="Professional Consultation" color="primary" variant="outlined" />
                <Chip label="Expert Advice" color="primary" variant="outlined" />
                <Chip label="Quality Service" color="primary" variant="outlined" />
                <Chip label="Verified Professional" color="success" variant="outlined" />
              </Box>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            variant="outlined" 
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            Close
          </Button>
          {user.role === 'user' && (
            <Button 
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={handleContactProfessional}
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              Request Services
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create Request Dialog */}
      <CreateRequestDialog
        open={createRequestOpen}
        onClose={() => setCreateRequestOpen(false)}
        admin={admin}
        onRequestCreated={handleRequestCreated}
      />

      {/* Success Message */}
      {showSuccess && (
        <SuccessMessage
          message="Request created successfully! The professional will be notified."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
};

export default AdminProfileDialog; 
