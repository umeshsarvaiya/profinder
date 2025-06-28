import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  PlayArrow as InProgressIcon,
  Done as CompletedIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const RequestManagement = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [responseData, setResponseData] = useState({
    status: '',
    adminNotes: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      if (user.role === 'user') {
        endpoint = '/api/user-requests/user-requests';
      } else if (user.role === 'admin') {
        endpoint = '/api/user-requests/admin-requests';
      } else if (user.role === 'superadmin') {
        endpoint = '/api/user-requests/all-requests';
      }

      const response = await axios.get(endpoint);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleResponse = (request) => {
    setSelectedRequest(request);
    setResponseData({
      status: '',
      adminNotes: '',
      startDate: '',
      endDate: ''
    });
    setResponseDialogOpen(true);
  };

  const handleResponseSubmit = async () => {
    try {
      const endpoint = selectedRequest.status === 'pending' 
        ? `/api/user-requests/admin-response/${selectedRequest._id}`
        : `/api/user-requests/update-status/${selectedRequest._id}`;

      await axios.put(endpoint, responseData);
      
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      setError('Error updating request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'approved':
        return <ApprovedIcon color="success" />;
      case 'rejected':
        return <RejectedIcon color="error" />;
      case 'in_progress':
        return <InProgressIcon color="primary" />;
      case 'completed':
        return <CompletedIcon color="success" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredRequests = requests.filter(request => {
    if (selectedTab === 0) return true; // All
    if (selectedTab === 1) return request.status === 'pending';
    if (selectedTab === 2) return request.status === 'approved' || request.status === 'in_progress';
    if (selectedTab === 3) return request.status === 'completed';
    if (selectedTab === 4) return request.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        {user.role === 'user' ? 'My Requests' : 
         user.role === 'admin' ? 'Incoming Requests' : 'All Requests'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Rejected" />
        </Tabs>
      </Paper>

      {/* Requests Grid */}
      <Grid container spacing={3}>
        {filteredRequests.map((request) => (
          <Grid item xs={12} md={6} lg={4} key={request._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {request.title}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(request.status)}
                    label={request.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {request.description.length > 100 
                    ? `${request.description.substring(0, 100)}...` 
                    : request.description}
                </Typography>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Timeline:</strong> {request.timeline.estimatedDays} days
                  </Typography>
                  <Typography variant="body2">
                    <strong>Created:</strong> {formatDate(request.createdAt)}
                  </Typography>
                  
                  {user.role === 'user' && request.admin?.userId && (
                    <Typography variant="body2">
                      <strong>Professional:</strong> {request.admin.userId.name}
                    </Typography>
                  )}
                  
                  {user.role === 'admin' && request.user && (
                    <Typography variant="body2">
                      <strong>Client:</strong> {request.user.name}
                    </Typography>
                  )}
                </Stack>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handleViewRequest(request)}
                    variant="outlined"
                  >
                    View Details
                  </Button>
                  
                  {user.role === 'admin' && request.status === 'pending' && (
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleResponse(request)}
                      variant="contained"
                      color="primary"
                    >
                      Respond
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredRequests.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No requests found
          </Typography>
        </Box>
      )}

      {/* Request Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Request Details
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedRequest && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                {selectedRequest.title}
              </Typography>
              
              <Chip
                icon={getStatusIcon(selectedRequest.status)}
                label={selectedRequest.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(selectedRequest.status)}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedRequest.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Timeline</Typography>
                  <Typography variant="body2">{selectedRequest.timeline.estimatedDays} days</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body2">{formatDate(selectedRequest.createdAt)}</Typography>
                </Grid>
                
                {selectedRequest.timeline.startDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                    <Typography variant="body2">{formatDate(selectedRequest.timeline.startDate)}</Typography>
                  </Grid>
                )}
                
                {selectedRequest.timeline.endDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                    <Typography variant="body2">{formatDate(selectedRequest.timeline.endDate)}</Typography>
                  </Grid>
                )}
              </Grid>
              
              {selectedRequest.adminNotes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Admin Notes</Typography>
                  <Typography variant="body2">{selectedRequest.adminNotes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {user.role === 'admin' && selectedRequest?.status === 'pending' && (
            <Button 
              variant="contained"
              onClick={() => {
                setDialogOpen(false);
                handleResponse(selectedRequest);
              }}
            >
              Respond to Request
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog 
        open={responseDialogOpen} 
        onClose={() => setResponseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Respond to Request
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={responseData.status}
              onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="approved">Approve</MenuItem>
              <MenuItem value="rejected">Reject</MenuItem>
              <MenuItem value="in_progress">Mark as In Progress</MenuItem>
              <MenuItem value="completed">Mark as Completed</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={responseData.adminNotes}
            onChange={(e) => setResponseData({ ...responseData, adminNotes: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          {responseData.status === 'approved' && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={responseData.startDate}
                  onChange={(e) => setResponseData({ ...responseData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={responseData.endDate}
                  onChange={(e) => setResponseData({ ...responseData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleResponseSubmit}
            disabled={!responseData.status}
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequestManagement; 