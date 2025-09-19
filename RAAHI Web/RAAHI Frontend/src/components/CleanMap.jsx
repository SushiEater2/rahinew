import React, { useMemo, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const CleanMap = ({ onLocationUpdate }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Memoized styles and settings
  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '600px',
    borderRadius: '12px',
    overflow: 'hidden'
  }), []);

  const center = useMemo(() => ({
    lat: 28.6139, // Delhi
    lng: 77.2090
  }), []);

  const zoom = useMemo(() => 12, []);

  // Tourist attractions in Delhi
  const touristAttractions = useMemo(() => [
    { id: 1, name: 'Red Fort', lat: 28.6562, lng: 77.2410, description: 'Historic Mughal fort and UNESCO World Heritage site' },
    { id: 2, name: 'India Gate', lat: 28.6129, lng: 77.2295, description: 'War memorial and iconic landmark' },
    { id: 3, name: 'Lotus Temple', lat: 28.5535, lng: 77.2588, description: 'Bahái House of Worship known for its lotus shape' },
    { id: 4, name: 'Qutub Minar', lat: 28.5245, lng: 77.1855, description: 'Medieval Islamic monument and UNESCO World Heritage site' },
    { id: 5, name: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507, description: 'Mughal Emperor\'s tomb and architectural masterpiece' },
    { id: 6, name: 'Akshardham Temple', lat: 28.6127, lng: 77.2773, description: 'Modern Hindu temple complex' },
    { id: 7, name: 'Jama Masjid', lat: 28.6507, lng: 77.2334, description: 'One of India\'s largest mosques' },
    { id: 8, name: 'Raj Ghat', lat: 28.6407, lng: 77.2490, description: 'Memorial to Mahatma Gandhi' }
  ], []);

  // Get user's live location
  const getCurrentLocation = useCallback(() => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    console.log('Requesting location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location found:', position.coords);
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        
        // Reverse geocode to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: userPos }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address;
              if (onLocationUpdate) {
                onLocationUpdate({
                  lat: userPos.lat,
                  lng: userPos.lng,
                  address: address
                });
              }
            } else {
              if (onLocationUpdate) {
                onLocationUpdate({
                  lat: userPos.lat,
                  lng: userPos.lng,
                  address: 'Your Current Location'
                });
              }
            }
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
          default:
            errorMsg += 'An unknown error occurred.';
            break;
        }
        
        setLocationError(errorMsg);
        
        // Fallback to default location (Delhi)
        if (onLocationUpdate) {
          onLocationUpdate({
            lat: center.lat,
            lng: center.lng,
            address: 'Delhi, India (Default)'
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [center.lat, center.lng, onLocationUpdate]);

  // Handle map load
  const onMapLoad = useCallback(() => {
    console.log('Map loaded, getting location...');
    getCurrentLocation();
  }, [getCurrentLocation]);

  const onMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Location Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={getCurrentLocation}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: userLocation ? '#22c55e' : '#007bff',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          📍 {userLocation ? 'Update Location' : 'Find My Location'}
        </button>
        
        {locationError && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fontSize: '12px',
            color: '#dc2626',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '200px'
          }}>
            {locationError}
          </div>
        )}
      </div>
      <LoadScript 
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        loadingElement={
          <div style={{
            height: '600px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }}></div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
                Loading Google Maps...
              </div>
              <div style={{ fontSize: '14px' }}>
                Please wait while we set up your map
              </div>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || center}
          zoom={zoom}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            gestureHandling: 'cooperative',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'simplified' }]
              }
            ]
          }}
        >
          {/* Your current location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              title='Your Current Location'
              icon={{
                path: window.google?.maps.SymbolPath.CIRCLE,
                fillColor: '#007bff',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 4,
                scale: 12
              }}
            />
          )}

          {/* Tourist attraction markers */}
          {touristAttractions.map((attraction) => (
            <Marker
              key={attraction.id}
              position={{ lat: attraction.lat, lng: attraction.lng }}
              title={attraction.name}
              onClick={() => onMarkerClick(attraction)}
              icon={{
                path: window.google?.maps.SymbolPath.CIRCLE,
                fillColor: '#34d399',
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 10
              }}
            />
          ))}

          {/* Info window for selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={onInfoWindowClose}
            >
              <div style={{
                padding: '12px',
                minWidth: '200px',
                maxWidth: '300px'
              }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#1f2937',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  📍 {selectedMarker.name}
                </h3>
                <p style={{
                  margin: '0',
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {selectedMarker.description}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CleanMap;