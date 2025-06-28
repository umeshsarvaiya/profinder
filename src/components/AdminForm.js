import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
  FormHelperText
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from '../api/axios';

const AdminForm = () => {
  const [formData, setFormData] = useState({
    profession: '',
    experience: '',
    city: '',
    pincode: ''
  });
  const [files, setFiles] = useState({
    aadharCard: null,
    voterId: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({
      ...files,
      [name]: selectedFiles[0] || null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Validate that at least one identity document is uploaded
    if (!files.aadharCard && !files.voterId) {
      setError('Please upload at least one identity document (Aadhar Card or Voter ID)');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Append files
      if (files.aadharCard) {
        formDataToSend.append('aadharCard', files.aadharCard);
      }
      if (files.voterId) {
        formDataToSend.append('voterId', files.voterId);
      }

      const response = await axios.post('/api/admin/submit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage(response.data.message);
      setFormData({
        profession: '',
        experience: '',
        city: '',
        pincode: ''
      });
      setFiles({
        aadharCard: null,
        voterId: null
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit admin form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Admin Verification Request
        </Typography>
        
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Submit your professional information and identity documents for admin verification. Your request will be reviewed by a super admin.
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Profession</InputLabel>
            <Select
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              label="Profession"
              required
            >
              <MenuItem value="Doctor">Doctor</MenuItem>
              <MenuItem value="Lawyer">Lawyer</MenuItem>
              <MenuItem value="Engineer">Engineer</MenuItem>
              <MenuItem value="Teacher">Teacher</MenuItem>
              <MenuItem value="Accountant">Accountant</MenuItem>
              <MenuItem value="Architect">Architect</MenuItem>
              <MenuItem value="Consultant">Consultant</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Years of Experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            margin="normal"
            required
            placeholder="e.g., 5 years"
          />

          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ maxLength: 6 }}
          />

          {/* Identity Documents Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Identity Documents
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please upload at least one valid identity document for verification. Accepted formats: JPG, PNG, PDF (Max 5MB)
          </Typography>

          {/* Aadhar Card Upload */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Input
              type="file"
              name="aadharCard"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              id="aadhar-card-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="aadhar-card-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 2 }}
              >
                {files.aadharCard ? files.aadharCard.name : 'Upload Aadhar Card'}
              </Button>
            </label>
            {files.aadharCard && (
              <FormHelperText>
                Selected: {files.aadharCard.name}
              </FormHelperText>
            )}
          </FormControl>

          {/* Voter ID Upload */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Input
              type="file"
              name="voterId"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              id="voter-id-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="voter-id-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ py: 2 }}
              >
                {files.voterId ? files.voterId.name : 'Upload Voter ID'}
              </Button>
            </label>
            {files.voterId && (
              <FormHelperText>
                Selected: {files.voterId.name}
              </FormHelperText>
            )}
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminForm; 