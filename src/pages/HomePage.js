import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Paper,
  useTheme,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Rating,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon,
  VerifiedUser as VerifiedIcon,
  AdminPanelSettings as AdminIcon,
  SupervisedUserCircle as SuperAdminIcon,
  Login as LoginIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Star as StarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';
import AdminProfileDialog from '../components/AdminProfileDialog';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [verifiedAdmins, setVerifiedAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const features = [
    {
      icon: <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Find Professionals',
      description: 'Search and discover verified professionals in your area with detailed profiles and reviews.'
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Verified Profiles',
      description: 'All professionals are thoroughly verified to ensure quality and reliability.'
    },
    {
      icon: <AdminIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      title: 'Admin Dashboard',
      description: 'Comprehensive admin tools to manage users, profiles, and platform operations.'
    },
    {
      icon: <SuperAdminIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Super Admin Panel',
      description: 'Advanced administrative controls for platform-wide management and oversight.'
    }
  ];

  // Fetch verified admins
  const fetchVerifiedAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/verified');
      const admins = response.data.map(admin => ({
        ...admin,
        name: admin.userId?.name || 'Unknown',
        profession: admin.profession,
        city: admin.city,
        experience: admin.experience
      }));
      setVerifiedAdmins(admins);
    } catch (error) {
      console.error('Error fetching verified admins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view profile button click
  const handleViewProfile = async (admin) => {
    try {
      setProfileLoading(true);
      setSelectedAdmin(admin);
      setProfileDialogOpen(true);
      
      // Fetch detailed admin profile
      const response = await axios.get(`/api/user/${admin._id}`);
      setSelectedAdmin(response.data);
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setSelectedAdmin(admin); // Use basic info if detailed fetch fails
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setProfileDialogOpen(false);
    setSelectedAdmin(null);
  };

  useEffect(() => {
    fetchVerifiedAdmins();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Welcome to ProFinder
              </Typography>
              <Typography variant="h5" paragraph sx={{ opacity: 0.9 }}>
                Connect with verified professionals and find the expertise you need
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/search')}
                  sx={{ 
                    mr: 2, 
                    backgroundColor: 'white', 
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' }
                  }}
                >
                  Start Searching
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Join Now
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', opacity: 0.1 }}>
                  PF
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Why Choose ProFinder?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Quick Actions Section */}
      <Container maxWidth="md" sx={{ mb: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h3" textAlign="center" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ py: 2 }}
              >
                Login to Your Account
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => navigate('/admin-dashboard')}
                sx={{ py: 2 }}
              >
                Admin Dashboard
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Verified Professionals Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Our Verified Professionals
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Discover trusted professionals in your area. {!isAuthenticated && 'Login to see full profiles and connect with them.'}
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            <Grid container spacing={4} sx={{ mb: 6 }}>
              {verifiedAdmins.map((admin, index) => (
                <Grid item xs={12} sm={6} lg={4} key={admin._id || index}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%', 
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': { 
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        borderColor: 'primary.main'
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
                      <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                        <WorkIcon sx={{ fontSize: 100 }} />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            mr: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {admin.name?.charAt(0)?.toUpperCase() || 'P'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                            {admin.name}
                          </Typography>
                          <Chip 
                            label="✅ Verified Professional" 
                            size="small"
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontSize: '0.7rem',
                              fontWeight: 'medium'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      {/* Profession */}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: 'primary.main', 
                          fontWeight: 'bold',
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
                        {admin.profession}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      {/* Details */}
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {admin.city}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TimeIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {admin.experience} years of experience
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon sx={{ color: 'warning.main', mr: 1.5, fontSize: 20 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating 
                              value={4.5} 
                              readOnly 
                              size="small" 
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              (4.5/5)
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>

                      {/* Action Button */}
                      {isAuthenticated ? (
                        <Button 
                          variant="contained" 
                          fullWidth
                          startIcon={<ViewIcon />}
                          onClick={() => handleViewProfile(admin)}
                          sx={{ 
                            borderRadius: 2,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                            }
                          }}
                        >
                          View Full Profile
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined" 
                          fullWidth
                          disabled
                          sx={{ 
                            borderRadius: 2,
                            py: 1.5,
                            borderColor: 'grey.300',
                            color: 'text.secondary'
                          }}
                        >
                          Login to View Profile
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {verifiedAdmins.length === 0 && !loading && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 6, 
                  borderRadius: 3, 
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  backgroundColor: 'grey.50'
                }}
              >
                <VerifiedIcon sx={{ fontSize: 80, color: 'grey.400', mb: 3 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No verified professionals found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Check back later for new verified professionals joining our platform.
                </Typography>
              </Paper>
            )}
            
            {/* Enhanced Call to Action for non-authenticated users */}
            {!isAuthenticated && verifiedAdmins.length > 0 && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 6, 
                  borderRadius: 3, 
                  textAlign: 'center', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
                  <VerifiedIcon sx={{ fontSize: 200 }} />
                </Box>
                
                <VerifiedIcon sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Unlock Full Access
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
                  Login to access our complete database of verified professionals with detailed profiles, contact information, and reviews.
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate('/login')}
                    sx={{ 
                      backgroundColor: 'white', 
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      '&:hover': { backgroundColor: 'grey.100' }
                    }}
                  >
                    Login Now
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      '&:hover': { 
                        borderColor: 'white', 
                        backgroundColor: 'rgba(255,255,255,0.1)' 
                      }
                    }}
                  >
                    Create Account
                  </Button>
                </Stack>
              </Paper>
            )}
          </>
        )}
      </Container>

      {/* Profile Dialog */}
      <AdminProfileDialog
        open={profileDialogOpen}
        onClose={handleCloseDialog}
        admin={selectedAdmin}
        loading={profileLoading}
      />

      {/* Footer */}
      <Box sx={{ 
        backgroundColor: 'grey.900', 
        color: 'white', 
        py: 4, 
        mt: 'auto' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center">
            © 2024 ProFinder. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
