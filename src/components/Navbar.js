import React, { useState, useEffect } from 'react';
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
  MenuItem,
  Badge,
  Popover,
  Divider
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
  Assignment as RequestIcon,
  Info as AboutIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from '../contexts/SidebarContext';
import NotificationIcon from './NotificationIcon';
import NotificationList from './NotificationList';
import axios from '../api/axios';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [bellAnchorEl, setBellAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useSidebar();

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await axios.get('/api/notification/unread-count');
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

console.log(user,"user")
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
console.log(isAuthenticated);
  const menuItems = [
    // Not authenticated: show Home, About Us, Login
    ...(isAuthenticated ? [
      { text: 'Home', path: '/', icon: <HomeIcon /> },
      { text: 'About Us', path: '/about', icon: <AboutIcon /> },
      { text: 'Login', path: '/login', icon: <LoginIcon /> },
    ] : []),
    // Superadmin: only show superadmin menus
    ...(isAuthenticated && user?.role === 'superadmin' ? [
      { text: 'Super Admin Panel', path: '/super-admin', icon: <SuperAdminIcon /> },
      { text: 'User Data Dashboard', path: '/user-data-dashboard', icon: <DashboardIcon /> },
    ] : []),
    // Admin: only show admin menus
    ...(isAuthenticated && user?.role === 'admin' ? [
     
    
    ] : []),
    // User: only show user menus
    ...(isAuthenticated && user?.role === 'user' ? [
      { text: 'Become Admin', path: '/admin-form', icon: <FormIcon /> },  
    ] : []),
  ];

  

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    toggleSidebar();
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

  const handleBellClick = (event) => setBellAnchorEl(event.currentTarget);
  const handleBellClose = () => setBellAnchorEl(null);
  const bellOpen = Boolean(bellAnchorEl);

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
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              ...(isAuthenticated && user?.role === 'superadmin' && location.pathname === '/super-admin' && {
                display: 'none'
              })
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Sidebar toggle for Super Admin */}
          {isAuthenticated && user?.role === 'superadmin' && location.pathname === '/super-admin' && (
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ 
                mr: 2, 
                backgroundColor: 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.08)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
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
                  <IconButton color="inherit" onClick={handleBellClick} sx={{ ml: 1 }}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <Popover
                    open={bellOpen}
                    anchorEl={bellAnchorEl}
                    onClose={handleBellClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { width: 350, maxHeight: 400 } }}
                  >
                    <NotificationList 
                      onNotificationRead={() => {
                        setUnreadCount(prev => Math.max(0, prev - 1));
                        handleBellClose(); // Close popover when notification is clicked
                      }} 
                    />
                  </Popover>
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
                    {user?.role === 'user' && (
                      <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/requests'); }}>
                        <ListItemIcon>
                          <RequestIcon fontSize="small" />
                        </ListItemIcon>
                        My Requests
                      </MenuItem>
                    )}
                    {user?.role === 'admin' && (
                      <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/requests'); }}>
                        <ListItemIcon>
                          <RequestIcon fontSize="small" />
                        </ListItemIcon>
                        Request Management
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/notifications'); }}>
                      <ListItemIcon>
                        <NotificationsIcon fontSize="small" />
                      </ListItemIcon>
                      Notifications
                    </MenuItem>
                    <Divider />
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
          {isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={handleBellClick} size="large">
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Popover
                open={bellOpen}
                anchorEl={bellAnchorEl}
                onClose={handleBellClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 350, maxHeight: 400 } }}
              >
                <NotificationList 
                  onNotificationRead={() => {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    handleBellClose();
                  }} 
                />
              </Popover>
              <IconButton onClick={handleProfileMenuOpen} size="large">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <AccountIcon />
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { handleNavigation('/admin-profile'); handleProfileMenuClose(); }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                {user?.role === 'user' && (
                  <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/requests'); }}>
                    <ListItemIcon>
                      <RequestIcon fontSize="small" />
                    </ListItemIcon>
                    My Requests
                  </MenuItem>
                )}
                {user?.role === 'admin' && (
                  <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/requests'); }}>
                    <ListItemIcon>
                      <RequestIcon fontSize="small" />
                    </ListItemIcon>
                    Request Management
                  </MenuItem>
                )}
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/notifications'); }}>
                  <ListItemIcon>
                    <NotificationsIcon fontSize="small" />
                  </ListItemIcon>
                  Notifications
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
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
        {isMobile && isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1, gap: 1 }}>
            <IconButton color="inherit" onClick={handleBellClick} size="large">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Popover
              open={bellOpen}
              anchorEl={bellAnchorEl}
              onClose={handleBellClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 350, maxHeight: 400 } }}
            >
              <NotificationList 
                onNotificationRead={() => {
                  setUnreadCount(prev => Math.max(0, prev - 1));
                  handleBellClose();
                }} 
              />
            </Popover>
            <IconButton onClick={handleProfileMenuOpen} size="large">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <AccountIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { handleNavigation('/admin-profile'); handleProfileMenuClose(); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              {user?.role === 'user' && (
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/requests'); }}>
                  <ListItemIcon>
                    <RequestIcon fontSize="small" />
                  </ListItemIcon>
                  My Requests
                </MenuItem>
              )}
              {user?.role === 'admin' && (
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/requests'); }}>
                  <ListItemIcon>
                    <RequestIcon fontSize="small" />
                  </ListItemIcon>
                  Request Management
                </MenuItem>
              )}
              <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/notifications'); }}>
                <ListItemIcon>
                  <NotificationsIcon fontSize="small" />
                </ListItemIcon>
                Notifications
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default Navbar; 