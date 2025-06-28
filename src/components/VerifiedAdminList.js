import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Search, LocationOn, Work, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';

const VerifiedAdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  // Available options for filters
  const [professions, setProfessions] = useState([]);
  const [cities, setCities] = useState([]);
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Fetch all verified admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/verified');
      const adminsData = response.data.map(admin => ({
        ...admin,
        name: admin.userId?.name || 'Unknown',
        email: admin.userId?.email || '',
        profession: admin.profession,
        city: admin.city,
        experience: admin.experience,
        pincode: admin.pincode
      }));
      
      setAdmins(adminsData);
      setFilteredAdmins(adminsData);
      
      // Fetch filter options from backend
      await fetchFilterOptions();
      
    } catch (err) {
      setError('Failed to load verified professionals');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options (professions and cities)
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('/api/admin/filter-options');
      setProfessions(response.data.professions);
      setCities(response.data.cities);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Fallback: extract from current admins data
      const uniqueProfessions = [...new Set(admins.map(admin => admin.profession))];
      const uniqueCities = [...new Set(admins.map(admin => admin.city))];
      setProfessions(uniqueProfessions);
      setCities(uniqueCities);
    }
  };

  // Enhanced search with backend support
  const performSearch = async () => {
    try {
      setSearchLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedProfession) params.append('profession', selectedProfession);
      if (selectedCity) params.append('city', selectedCity);
      
      const response = await axios.get(`/api/admin/search?${params.toString()}`);
      const adminsData = response.data.map(admin => ({
        ...admin,
        name: admin.userId?.name || 'Unknown',
        email: admin.userId?.email || '',
        profession: admin.profession,
        city: admin.city,
        experience: admin.experience,
        pincode: admin.pincode
      }));
      
      setFilteredAdmins(adminsData);
    } catch (err) {
      console.error('Search error:', err);
      // Fallback to client-side filtering
      applyFilters();
    } finally {
      setSearchLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = () => {
    let filtered = admins;

    // Filter by search term (name, profession, or city)
    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by profession
    if (selectedProfession) {
      filtered = filtered.filter(admin => admin.profession === selectedProfession);
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(admin => admin.city === selectedCity);
    }

    setFilteredAdmins(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProfession('');
    setSelectedCity('');
    setFilteredAdmins(admins);
  };

  // Handle admin card click
  const handleAdminClick = (admin) => {
    navigate(`/admin/${admin._id}`);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedProfession || selectedCity) {
        performSearch();
      } else {
        setFilteredAdmins(admins);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedProfession, selectedCity]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading verified professionals...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section for Logged-in Users */}
      {isAuthenticated && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Person sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Welcome back!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                You're now logged in and can access all verified professionals
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Browse through our verified professionals, use the search and filter options below to find exactly what you need.
          </Typography>
        </Paper>
      )}

      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Verified Professionals
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover trusted and verified professionals in your area
        {isAuthenticated && (
          <span style={{ fontWeight: 'bold', color: 'primary.main' }}>
            {' '}• You have full access to all features
          </span>
        )}
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Search & Filter
        </Typography>
        
        <Grid container spacing={3}>
          {/* Search Input */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search professionals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by name, profession, or city"
            />
          </Grid>

          {/* Profession Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Profession</InputLabel>
              <Select
                value={selectedProfession}
                label="Profession"
                onChange={(e) => setSelectedProfession(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <Work />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Professions</MenuItem>
                {professions.map((profession) => (
                  <MenuItem key={profession} value={profession}>
                    {profession}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* City Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>City</InputLabel>
              <Select
                value={selectedCity}
                label="City"
                onChange={(e) => setSelectedCity(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Cities</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Search Button */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={performSearch}
              sx={{ height: '56px' }}
              startIcon={<Search />}
            >
              Search
            </Button>
          </Grid>

          {/* Clear Filters Button */}
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: '56px' }}
            >
              Clear All Filters
            </Button>
          </Grid>
        </Grid>

        {/* Results Count */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredAdmins.length} professional{filteredAdmins.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
      </Card>

      {/* Results Section */}
      {searchLoading ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Searching professionals...
          </Typography>
        </Card>
      ) : filteredAdmins.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No professionals found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search terms or filters
          </Typography>
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredAdmins.map((admin) => (
              <Grid item xs={12} sm={6} md={4} key={admin._id}>
                <Card
                  onClick={() => handleAdminClick(admin)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {admin.name}
                      </Typography>
                      <Chip 
                        label="✅ Verified" 
                        color="success" 
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'primary.main', 
                        fontWeight: 'medium',
                        mb: 1 
                      }}
                    >
                      {admin.profession}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📍 {admin.city}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      ⏱️ {admin.experience} years experience
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Button 
                        variant="contained" 
                        size="small" 
                        fullWidth
                        sx={{ borderRadius: 2 }}
                      >
                        View Profile
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Call to Action for Logged-in Users */}
          {isAuthenticated && filteredAdmins.length > 0 && (
            <Card sx={{ mt: 4, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Need to connect with a professional?
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  You're logged in and can access detailed profiles and contact information
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                  onClick={() => navigate('/search')}
                >
                  Explore More Professionals
                </Button>
              </Box>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default VerifiedAdminList; 