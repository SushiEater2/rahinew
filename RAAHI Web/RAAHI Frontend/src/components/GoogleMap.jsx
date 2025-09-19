import React, { useEffect, useRef, useState } from 'react';
import '../styles/google-maps.css';

const GoogleMap = ({ 
  onLocationUpdate, 
  safetyData = [], 
  emergencyServices = [], 
  touristAttractions = [] 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (!window.google || !mapRef.current) {
        console.warn('Google Maps API not loaded or mapRef not available');
        return;
      }

      // Default location (India Gate, New Delhi)
      const defaultLocation = { lat: 28.6129, lng: 77.2295 };
      
      const mapOptions = {
        zoom: 12,
        center: defaultLocation,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{"visibility": "simplified"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{"saturation": -100}]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userPos);
            map.setCenter(userPos);
            
            // Add user location marker
            const userMarker = new window.google.maps.Marker({
              position: userPos,
              map: map,
              title: 'Your Location',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#007bff" stroke="white" stroke-width="3"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
              },
            });

            // Update location in parent component
            if (onLocationUpdate) {
              onLocationUpdate({
                lat: userPos.lat,
                lng: userPos.lng,
                address: 'Current Location'
              });
            }

            // Get location name
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: userPos }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const address = results[0].formatted_address;
                userMarker.setTitle(`Your Location: ${address}`);
                if (onLocationUpdate) {
                  onLocationUpdate({
                    lat: userPos.lat,
                    lng: userPos.lng,
                    address: address
                  });
                }
              }
            });
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Fallback to default location
            if (onLocationUpdate) {
              onLocationUpdate({
                lat: defaultLocation.lat,
                lng: defaultLocation.lng,
                address: 'India Gate, New Delhi'
              });
            }
          }
        );
      }
    };

    // Load Google Maps API if not already loaded
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing. Please check your .env file.');
      return;
    }
    
    if (!window.google) {
      console.log('Loading Google Maps API...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        initMap();
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
        console.error('Please check your API key and network connection.');
      };
      document.head.appendChild(script);
    } else {
      console.log('Google Maps API already loaded');
      initMap();
    }
  }, [onLocationUpdate]);

  // Add safety zones to map
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return;

    const map = mapInstanceRef.current;

    // Sample safety zones data
    const defaultSafetyZones = [
      { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, safety: 92, color: '#10b981' },
      { name: 'India Gate', lat: 28.6129, lng: 77.2295, safety: 85, color: '#10b981' },
      { name: 'Red Fort', lat: 28.6562, lng: 77.2410, safety: 88, color: '#10b981' },
      { name: 'Karol Bagh', lat: 28.6519, lng: 77.1909, safety: 68, color: '#f59e0b' },
      { name: 'Chandni Chowk', lat: 28.6506, lng: 77.2334, safety: 45, color: '#ef4444' },
      { name: 'Lajpat Nagar', lat: 28.5677, lng: 77.2436, safety: 73, color: '#f59e0b' },
    ];

    const safetyZones = safetyData.length > 0 ? safetyData : defaultSafetyZones;

    safetyZones.forEach(zone => {
      // Create safety zone circle
      const safetyCircle = new window.google.maps.Circle({
        strokeColor: zone.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: zone.color,
        fillOpacity: 0.35,
        map: map,
        center: { lat: zone.lat, lng: zone.lng },
        radius: 1000, // 1km radius
      });

      // Create marker for safety zone
      const marker = new window.google.maps.Marker({
        position: { lat: zone.lat, lng: zone.lng },
        map: map,
        title: `${zone.name} - Safety Score: ${zone.safety}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="${zone.color}" stroke="white" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${zone.safety}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      // Info window for safety zone
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${zone.name}</h3>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                background: ${zone.color}; 
                color: white; 
                padding: 5px 10px; 
                border-radius: 15px; 
                font-weight: bold;
              ">
                Safety Score: ${zone.safety}
              </div>
            </div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              ${zone.safety >= 80 ? 'Very Safe Area' : 
                zone.safety >= 50 ? 'Moderate Safety' : 'High Risk Area'}
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [mapLoaded, safetyData]);

  // Add emergency services markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return;

    const map = mapInstanceRef.current;

    // Default emergency services
    const defaultServices = [
      { name: 'AIIMS Hospital', lat: 28.5672, lng: 77.2100, type: 'hospital', icon: '🏥' },
      { name: 'All India Institute of Medical Sciences', lat: 28.5672, lng: 77.2100, type: 'hospital', icon: '🏥' },
      { name: 'Parliament Street Police Station', lat: 28.6185, lng: 77.2066, type: 'police', icon: '🚔' },
      { name: 'Connaught Place Police Station', lat: 28.6315, lng: 77.2167, type: 'police', icon: '🚔' },
      { name: 'Delhi Fire Station', lat: 28.6289, lng: 77.2065, type: 'fire', icon: '🚑' },
    ];

    const services = emergencyServices.length > 0 ? emergencyServices : defaultServices;

    services.forEach(service => {
      const marker = new window.google.maps.Marker({
        position: { lat: service.lat, lng: service.lng },
        map: map,
        title: service.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="#ff4444" stroke="white" stroke-width="2"/>
              <text x="15" y="19" text-anchor="middle" font-size="12">${service.icon}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${service.icon} ${service.name}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
              Emergency Service - ${service.type.charAt(0).toUpperCase() + service.type.slice(1)}
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [mapLoaded, emergencyServices]);

  // Add tourist attractions
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return;

    const map = mapInstanceRef.current;

    // Default tourist attractions
    const defaultAttractions = [
      { name: 'Red Fort', lat: 28.6562, lng: 77.2410, rating: 4.5, icon: '🏛️' },
      { name: 'India Gate', lat: 28.6129, lng: 77.2295, rating: 4.6, icon: '🏛️' },
      { name: 'Lotus Temple', lat: 28.5535, lng: 77.2588, rating: 4.7, icon: '🏛️' },
      { name: 'Qutub Minar', lat: 28.5245, lng: 77.1855, rating: 4.4, icon: '🗼' },
      { name: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507, rating: 4.5, icon: '🏛️' },
    ];

    const attractions = touristAttractions.length > 0 ? touristAttractions : defaultAttractions;

    attractions.forEach(attraction => {
      const marker = new window.google.maps.Marker({
        position: { lat: attraction.lat, lng: attraction.lng },
        map: map,
        title: attraction.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="12" fill="#007bff" stroke="white" stroke-width="2"/>
              <text x="15" y="19" text-anchor="middle" font-size="12">${attraction.icon}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${attraction.icon} ${attraction.name}</h3>
            <div style="display: flex; align-items: center; gap: 5px;">
              <span style="color: #f59e0b;">⭐</span>
              <span style="font-weight: bold;">${attraction.rating}</span>
            </div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              Tourist Attraction
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });
  }, [mapLoaded, touristAttractions]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
        }}
      />
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: '10px' }}>Loading Google Maps...</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
              'API Key Missing - Check .env file' : 
              'Connecting to Google Maps...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;