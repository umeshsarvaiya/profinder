import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import theme from './theme';
import { ToastContainer } from 'react-toastify';

// Import components
import Navbar from './components/Navbar';
import { NotificationProvider } from './hooks/useNotifications';
import { SidebarProvider } from './contexts/SidebarContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SearchProfessionals from './pages/SearchProfessionals';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import SuperAdminPanel from './components/SuperAdmin/SuperAdminPanel';
import VerifiedAdmins from './pages/VerifiedAdmins';
import UserDataDashboardPage from './pages/UserDataDashboardPage';
import RequestManagementPage from './pages/RequestManagementPage';
import NotFound from './pages/NotFound';
import SearchAdminWithMap from './pages/SearchAdminWithMap';
import AboutUsPage from './pages/AboutUsPage';
import AdminForm from './components/AdminForm';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer />
      <NotificationProvider>
        <SidebarProvider>
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
            
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                
                </ProtectedRoute>
              } />
            
              <Route path="/admin-profile" element={<AdminProfile />} />
              <Route path="/super-admin" element={
                <ProtectedRoute requiredRole="superadmin">
                  <SuperAdminPanel />
                  
                </ProtectedRoute>
              } />
              <Route path="/verified-admins" element={<VerifiedAdmins />} />
              <Route path="/user-data-dashboard" element={<UserDataDashboardPage />} />
              <Route path="/requests" element={<RequestManagementPage />} />
              <Route path="/admin-form" element={<AdminForm />} />
              <Route path="/search-admin-map" element={<SearchAdminWithMap />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
        </SidebarProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
