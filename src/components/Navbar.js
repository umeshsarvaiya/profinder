import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisedUserCircle as SuperAdminIcon,
  VerifiedUser as VerifiedIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Assignment as FormIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Dashboard as DashboardIcon,
  Assignment as RequestIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationIcon from './NotificationIcon';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const userName = user?.name || 'User';
  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/login');
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Search Professionals', path: '/search', icon: <SearchIcon /> },
    ...(isAuthenticated ? [
      { text: 'My Requests', path: '/requests', icon: <RequestIcon /> }
    ] : []),
    ...(isAuthenticated && user?.role === 'superadmin' ? [
      { text: 'Super Admin Panel', path: '/super-admin', icon: <SuperAdminIcon /> },
      { text: 'User Data Dashboard', path: '/user-data-dashboard', icon: <DashboardIcon /> },
    ] : isAuthenticated && user?.role === 'admin' ? [
      { text: 'Admin Dashboard', path: '/admin-dashboard', icon: <AdminIcon /> },
      { text: 'Admin Profile', path: '/admin-profile', icon: <PersonIcon /> },
    ] : isAuthenticated && user?.role === 'user' ? [
      { text: 'Become Admin', path: '/admin-form', icon: <FormIcon /> },
      { text: 'Verified Admins', path: '/verified-admins', icon: <VerifiedIcon /> },
    ] : [
      { text: 'Login', path: '/login', icon: <LoginIcon /> },
      { text: 'Register', path: '/register', icon: <RegisterIcon /> },
    ])
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" color="primary">
          ProFinder
        </Typography>
        {isAuthenticated && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Welcome back, {userName}!
          </Typography>
        )}
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              backgroundColor: isActive(item.path) ? 'primary.light' : 'transparent',
              color: isActive(item.path) ? 'primary.contrastText' : 'inherit',
              '&:hover': {
                backgroundColor: isActive(item.path) ? 'primary.main' : 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.contrastText' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {isAuthenticated && (
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={2} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: 'primary.main',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => handleNavigation('/')}
          >
            ProFinder
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: isActive(item.path) ? 'primary.main' : 'transparent',
                    color: isActive(item.path) ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive(item.path) ? 'primary.dark' : 'action.hover',
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
              
              {isAuthenticated && (
                <>
                  {user?.role === 'superadmin' && <NotificationIcon />}
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <AccountIcon />
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={() => { handleNavigation('/admin-profile'); handleProfileMenuClose(); }}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 