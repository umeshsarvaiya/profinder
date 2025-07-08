// 📁 client/src/pages/Login.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Box,
  Alert,
  Link
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';
import { showSuccessToast, showErrorToast } from '../components/CustomToast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const res = await axios.post('/api/auth/login', form);
      
      // Use the auth hook to handle login
      login(res.data);
      
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      showSuccessToast('Login successful! Redirecting...');
      setForm({ email: '', password: '' });
      
      // Determine redirect path based on user role
      let redirectPath = from;
      if (res.data.user.role === 'superadmin') {
        redirectPath = '/super-admin';
      } else if (res.data.user.role === 'admin') {
        redirectPath = '/admin-dashboard';
      } else if (res.data.user.role === 'user') {
        redirectPath = from === '/' ? '/' : from;
      }
      
      // Redirect to the appropriate path
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
      
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Invalid credentials. Please try again.' 
      });
      showErrorToast(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your ProFinder account
          </Typography>
          {from !== '/' && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Please login to access {from}
            </Typography>
          )}
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <TextField 
          fullWidth 
          label="Email" 
          name="email" 
          type="email"
          value={form.email}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          margin="normal" 
          required
          disabled={loading}
        />
        <TextField 
          fullWidth 
          label="Password" 
          name="password" 
          type="password" 
          value={form.password}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          margin="normal" 
          required
          disabled={loading}
        />
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          size="large"
          onClick={handleLogin}
          disabled={loading || !form.email || !form.password}
          sx={{ mt: 3, py: 1.5 }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
              sx={{ textDecoration: 'none' }}
            >
              Forgot your password?
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: '#6a11cb' } }}
            >
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
