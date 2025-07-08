import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Search, LocationOn, Work } from '@mui/icons-material';
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
  const { isAuthenticated } = useAuth();

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
    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedProfession) {
      filtered = filtered.filter(admin => admin.profession === selectedProfession);
    }
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

  // Handle admin row click
  const handleAdminClick = (admin) => {
    navigate(`/admin/${admin._id}`);
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || selectedProfession || selectedCity) {
        performSearch();
      } else {
        setFilteredAdmins(admins);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Verified Professionals
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Discover trusted and verified professionals in your area
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {/* Simple Search & Filter Row */}
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            placeholder="Name, profession, or city"
            sx={{ minWidth: 180 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Profession</InputLabel>
            <Select
              value={selectedProfession}
              label="Profession"
              onChange={e => setSelectedProfession(e.target.value)}
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
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>City</InputLabel>
            <Select
              value={selectedCity}
              label="City"
              onChange={e => setSelectedCity(e.target.value)}
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
          <Button
            variant="contained"
            onClick={performSearch}
            startIcon={<Search />}
            size="small"
            sx={{ minWidth: 100 }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={clearFilters}
            size="small"
            sx={{ minWidth: 120 }}
          >
            Clear Filters
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', minWidth: 120 }}>
            {filteredAdmins.length} found
          </Typography>
        </Box>
      </Paper>
      {/* Table View */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Profession</b></TableCell>
              <TableCell><b>City</b></TableCell>
              <TableCell><b>Experience</b></TableCell>
              <TableCell align="center"><b>Action</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={32} /> Searching professionals...
                </TableCell>
              </TableRow>
            ) : filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No professionals found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin._id} hover>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.profession}</TableCell>
                  <TableCell>{admin.city}</TableCell>
                  <TableCell>{admin.experience} yrs</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAdminClick(admin)}
                      aria-label={`View profile of ${admin.name}`}
                    >
                      View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default VerifiedAdminList; 