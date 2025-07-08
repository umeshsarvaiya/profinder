import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Chip } from '@mui/material';
import axios from '../api/axios';

const AdminProfile = () => {
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    axios.get(`/api/user/${id}`)
      .then(res => setAdmin(res.data))
      .catch(err => console.error('Error fetching profile:', err));
  }, [id]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {admin ? (
          <>
            <Typography variant="h5">{admin.name}</Typography>
            <Typography>Profession: {admin.profession}</Typography>
            <Typography>Experience: {admin.experience}</Typography>
            <Typography>City: {admin.city}</Typography>
            <Typography>Pincode: {admin.pincode}</Typography>
            <Box mt={2}>
              <Chip label="✅ Verified" color="success" />
            </Box>
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AdminProfile;
