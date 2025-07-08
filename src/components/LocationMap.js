import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { MyLocation as LocationIcon } from '@mui/icons-material';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 20.5937, // India center
  lng: 78.9629
};

const LocationMap = ({ onLocationSelect, selectedLocation }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(selectedLocation || defaultCenter);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCCRDdzC4-8aMliCT4at-LTN0bB12GwkA0'
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((event) => {
    const newLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMarker(newLocation);
    onLocationSelect(newLocation);
  }, [onLocationSelect]);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMarker(newLocation);
          onLocationSelect(newLocation);
          if (map) {
            map.panTo(newLocation);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading map...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Select Your Location</Typography>
        <Button
          variant="outlined"
          startIcon={<LocationIcon />}
          onClick={getCurrentLocation}
          disabled={loading}
        >
          {loading ? 'Getting Location...' : 'Use Current Location'}
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click on the map to set your location or use the button above to get your current location.
      </Typography>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        <Marker
          position={marker}
          draggable={true}
          onDragEnd={(event) => {
            const newLocation = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            setMarker(newLocation);
            onLocationSelect(newLocation);
          }}
        />
      </GoogleMap>

      {marker && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Selected Location: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default LocationMap; 