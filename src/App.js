import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import { NotificationProvider } from './hooks/useNotifications';

// Import pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SearchProfessionals from './pages/SearchProfessionals';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import SuperAdminPanel from './pages/SuperAdminPanel';
import VerifiedAdmins from './pages/VerifiedAdmins';
import UserDataDashboardPage from './pages/UserDataDashboardPage';
import RequestManagementPage from './pages/RequestManagementPage';
import NotFound from './pages/NotFound';
import SearchAdminWithMap from './pages/SearchAdminWithMap';

import AdminForm from './components/AdminForm';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/search" element={<SearchProfessionals />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-profile" element={<AdminProfile />} />
              <Route path="/super-admin" element={<SuperAdminPanel />} />
              <Route path="/verified-admins" element={<VerifiedAdmins />} />
              <Route path="/user-data-dashboard" element={<UserDataDashboardPage />} />
              <Route path="/requests" element={<RequestManagementPage />} />
              <Route path="/admin-form" element={<AdminForm />} />
              <Route path="/search-admin-map" element={<SearchAdminWithMap />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
