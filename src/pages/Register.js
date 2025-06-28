import React, { useState } from 'react';
import { 
  Button, 
  TextField, 
  MenuItem, 
  Container, 
  Typography, 
  Paper, 
  Box,
  Alert,
  Link
} from '@mui/material';
import { PersonAdd as RegisterIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const roles = ['superadmin', 'admin', 'user'];

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('/api/auth/register', form);
      setMessage({ type: 'success', text: 'Registered successfully!' });
      setForm({ name: '', email: '', password: '', role: 'user' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <RegisterIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join ProFinder and connect with professionals
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <TextField 
          fullWidth 
          label="Full Name" 
          name="name" 
          value={form.name}
          onChange={handleChange} 
          margin="normal" 
          required
        />
        <TextField 
          fullWidth 
          label="Email" 
          name="email" 
          type="email"
          value={form.email}
          onChange={handleChange} 
          margin="normal" 
          required
        />
        <TextField 
          fullWidth 
          label="Password" 
          name="password" 
          type="password" 
          value={form.password}
          onChange={handleChange} 
          margin="normal" 
          required
        />
        {/* <TextField 
          select 
          fullWidth 
          label="Role" 
          name="role" 
          value={form.role} 
          onChange={handleChange} 
          margin="normal"
          helperText="Select your role in the platform"
        >
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </MenuItem>
          ))}
        </TextField> */}
        
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={handleSubmit}
          sx={{ mt: 3, py: 1.5 }}
        >
          Create Account
        </Button>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ textDecoration: 'none' }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
