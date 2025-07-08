import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  CircularProgress,
  Grid,
  Avatar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import { AccessTime, Work, LocationOn, Email, Done, HourglassEmpty, CheckCircle, Cancel, Person } from '@mui/icons-material';
import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const statusConfig = {
  pending: { color: 'warning', label: 'Pending', icon: <HourglassEmpty fontSize="small" /> },
  approved: { color: 'info', label: 'Approved', icon: <CheckCircle fontSize="small" /> },
  rejected: { color: 'error', label: 'Rejected', icon: <Cancel fontSize="small" /> },
  in_progress: { color: 'primary', label: 'In Progress', icon: <AccessTime fontSize="small" /> },
  completed: { color: 'success', label: 'Completed', icon: <Done fontSize="small" /> }
};

const RequestManagement = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Admin action dialog state
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', request: null });
  const [actionForm, setActionForm] = useState({ startDate: '', endDate: '', adminNotes: '', status: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        let res;
        if (user?.role === 'user') {
          res = await axios.get('/api/user-requests/user-requests');
        } else if (user?.role === 'admin') {
          res = await axios.get('/api/user-requests/admin-requests');
        }
        setRequests(res?.data || []);
      } catch (err) {
        setError('Failed to fetch requests.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'user' || user?.role === 'admin') fetchRequests();
  }, [user]);

  // Open dialog for approve/reject or status update
  const openActionDialog = (type, request) => {
    setActionForm({
      startDate: '',
      endDate: '',
      adminNotes: '',
      status: type === 'status' ? 'in_progress' : ''
    });
    setActionError('');
    setActionDialog({ open: true, type, request });
  };
  const closeActionDialog = () => setActionDialog({ open: false, type: '', request: null });

  // Handle admin action (approve/reject/status)
  const handleActionSubmit = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      if (actionDialog.type === 'approve') {
        if (!actionForm.startDate || !actionForm.endDate) {
          setActionError('Start and end dates are required.');
          setActionLoading(false);
          return;
        }
        await axios.put(`/api/user-requests/admin-response/${actionDialog.request._id}`, {
          status: 'approved',
          adminNotes: actionForm.adminNotes,
          startDate: actionForm.startDate,
          endDate: actionForm.endDate
        });
      } else if (actionDialog.type === 'reject') {
        await axios.put(`/api/user-requests/admin-response/${actionDialog.request._id}`, {
          status: 'rejected',
          adminNotes: actionForm.adminNotes
        });
      } else if (actionDialog.type === 'status') {
        await axios.put(`/api/user-requests/update-status/${actionDialog.request._id}`, {
          status: actionForm.status,
          adminNotes: actionForm.adminNotes
        });
      }
      // Refresh requests
      const res = await axios.get('/api/user-requests/admin-requests');
      setRequests(res.data);
      closeActionDialog();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!requests.length) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {user?.role === 'user' 
            ? "You haven't made any requests yet." 
            : "No incoming requests yet."
          }
        </Typography>
        {user?.role === 'user' && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start by searching for professionals and requesting their services.
          </Typography>
        )}
        {user?.role === 'admin' && (
          <Typography variant="body1" color="text.secondary">
            When users request your services, they will appear here.
          </Typography>
        )}
      </Box>
    );
  }

  // USER VIEW
  if (user?.role === 'user') {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>My Requests</Typography>
        <Grid container spacing={3}>
          {requests.map((req) => {
            const status = statusConfig[req.status] || { color: 'default', label: req.status };
            return (
              <Grid item xs={12} md={6} lg={4} key={req._id}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>
                      {req.admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{req.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{req.admin?.name} ({req.admin?.profession})</Typography>
                    </Box>
                    <Chip
                      label={status.label}
                      color={status.color}
                      icon={status.icon}
                      sx={{ ml: 'auto', fontWeight: 'bold' }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <Work sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} /> {req.admin?.profession}
                    {'  '}<LocationOn sx={{ fontSize: 18, ml: 2, mr: 0.5, verticalAlign: 'middle' }} /> {req.admin?.city}, {req.admin?.pincode}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{req.description}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Chip icon={<AccessTime />} label={`Estimated: ${req.timeline?.estimatedDays} days`} size="small" />
                    {req.timeline?.startDate && <Chip icon={<AccessTime />} label={`Start: ${new Date(req.timeline.startDate).toLocaleDateString()}`} size="small" />}
                    {req.timeline?.endDate && <Chip icon={<AccessTime />} label={`End: ${new Date(req.timeline.endDate).toLocaleDateString()}`} size="small" />}
                  </Stack>
                  {req.adminNotes && (
                    <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                      <strong>Admin Notes:</strong> {req.adminNotes}
                    </Alert>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }

  // ADMIN VIEW
  if (user?.role === 'admin') {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Incoming Requests</Typography>
        <Grid container spacing={3}>
          {requests.map((req) => {
            const status = statusConfig[req.status] || { color: 'default', label: req.status };
            return (
              <Grid item xs={12} md={6} lg={4} key={req._id}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 'bold' }}>
                      {req.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{req.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{req.user?.name} ({req.user?.email})</Typography>
                    </Box>
                    <Chip
                      label={status.label}
                      color={status.color}
                      icon={status.icon}
                      sx={{ ml: 'auto', fontWeight: 'bold' }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <Email sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} /> {req.user?.email}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{req.description}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Chip icon={<AccessTime />} label={`Estimated: ${req.timeline?.estimatedDays} days`} size="small" />
                    {req.timeline?.startDate && <Chip icon={<AccessTime />} label={`Start: ${new Date(req.timeline.startDate).toLocaleDateString()}`} size="small" />}
                    {req.timeline?.endDate && <Chip icon={<AccessTime />} label={`End: ${new Date(req.timeline.endDate).toLocaleDateString()}`} size="small" />}
                  </Stack>
                  {req.adminNotes && (
                    <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                      <strong>Notes:</strong> {req.adminNotes}
                    </Alert>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </Typography>
                  {/* Action buttons */}
                  {req.status === 'pending' && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="contained" color="success" onClick={() => openActionDialog('approve', req)}>
                        Approve
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => openActionDialog('reject', req)}>
                        Reject
                      </Button>
                    </Stack>
                  )}
                  {req.status === 'approved' && (
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => openActionDialog('status', req)}>
                      Update Status
                    </Button>
                  )}
                  {req.status === 'in_progress' && (
                    <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={() => openActionDialog('status', req)}>
                      Mark as Completed
                    </Button>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {actionDialog.type === 'approve' && 'Approve Request'}
            {actionDialog.type === 'reject' && 'Reject Request'}
            {actionDialog.type === 'status' && 'Update Request Status'}
          </DialogTitle>
          <DialogContent>
            {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
            {(actionDialog.type === 'approve') && (
              <>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={actionForm.startDate}
                  onChange={e => setActionForm(f => ({ ...f, startDate: e.target.value }))}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={actionForm.endDate}
                  onChange={e => setActionForm(f => ({ ...f, endDate: e.target.value }))}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Notes (optional)"
                  fullWidth
                  multiline
                  minRows={2}
                  value={actionForm.adminNotes}
                  onChange={e => setActionForm(f => ({ ...f, adminNotes: e.target.value }))}
                />
              </>
            )}
            {(actionDialog.type === 'reject') && (
              <TextField
                label="Rejection Notes (optional)"
                fullWidth
                multiline
                minRows={2}
                value={actionForm.adminNotes}
                onChange={e => setActionForm(f => ({ ...f, adminNotes: e.target.value }))}
              />
            )}
            {(actionDialog.type === 'status') && (
              <>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={actionForm.status}
                  onChange={e => setActionForm(f => ({ ...f, status: e.target.value }))}
                  sx={{ mb: 2 }}
                >
                  {actionDialog.request.status === 'approved' && (
                    <MenuItem value="in_progress">In Progress</MenuItem>
                  )}
                  {actionDialog.request.status === 'in_progress' && (
                    <MenuItem value="completed">Completed</MenuItem>
                  )}
                </TextField>
                <TextField
                  label="Notes (optional)"
                  fullWidth
                  multiline
                  minRows={2}
                  value={actionForm.adminNotes}
                  onChange={e => setActionForm(f => ({ ...f, adminNotes: e.target.value }))}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeActionDialog} disabled={actionLoading}>Cancel</Button>
            <Button onClick={handleActionSubmit} variant="contained" disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Default fallback
  return null;
};

export default RequestManagement; 