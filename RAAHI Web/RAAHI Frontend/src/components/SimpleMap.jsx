import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/google-maps.css';

const SimpleMap = ({ onLocationUpdate }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Cleanup function
  const cleanupMap = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Initialize Google Map
  const initMap = useCallback(() => {
    if (!window.google || !mapRef.current || !isScriptLoaded) {
      console.warn('Google Maps API not ready or mapRef not available');
      return;
    }

    try {
      cleanupMap();

      // Default location (India Gate, New Delhi)
      const defaultLocation = { lat: 28.6129, lng: 77.2295 };
      
      const mapOptions = {
        zoom: 13,
        center: defaultLocation,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        gestureHandling: 'cooperative'
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Wait for map to be fully loaded
      google.maps.event.addListenerOnce(map, 'idle', () => {
        setMapLoaded(true);
        console.log('Simple map fully loaded');
      });

      // Add resize listener
      google.maps.event.addListener(map, 'resize', () => {
        if (userLocation) {
          map.setCenter(userLocation);
        } else {
          map.setCenter(defaultLocation);
        }
      });

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
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#007bff',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
                scale: 8
              },
              zIndex: 1000
            });
            
            markersRef.current.push(userMarker);

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
            if (onLocationUpdate) {
              onLocationUpdate({
                lat: defaultLocation.lat,
                lng: defaultLocation.lng,
                address: 'India Gate, New Delhi'
              });
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      }

      // Add some popular tourist attractions as markers
      const touristSpots = [
        { name: 'Red Fort', lat: 28.6562, lng: 77.2410, icon: '🏛️' },
        { name: 'India Gate', lat: 28.6129, lng: 77.2295, icon: '🏛️' },
        { name: 'Lotus Temple', lat: 28.5535, lng: 77.2588, icon: '🪷' },
        { name: 'Qutub Minar', lat: 28.5245, lng: 77.1855, icon: '🗼' },
        { name: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507, icon: '🏛️' },
        { name: 'Akshardham Temple', lat: 28.6127, lng: 77.2773, icon: '🛕' },
        { name: 'Jama Masjid', lat: 28.6507, lng: 77.2334, icon: '🕌' }
      ];

      touristSpots.forEach(spot => {
        const marker = new window.google.maps.Marker({
          position: { lat: spot.lat, lng: spot.lng },
          map: map,
          title: spot.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#34d399',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 10
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">
                ${spot.icon} ${spot.name}
              </h3>
              <p style="margin: 0; color: #666; font-size: 14px;">
                📍 Tourist Attraction
              </p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
      });

    } catch (error) {
      console.error('Error initializing simple map:', error);
    }
  }, [isScriptLoaded, onLocationUpdate, cleanupMap]);

  // Load Google Maps Script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsScriptLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is missing. Please check your .env file.');
      return;
    }

    console.log('Loading Google Maps API for simple map...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Maps API loaded successfully');
      setIsScriptLoaded(true);
    };
    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error);
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        observer.unobserve(mapRef.current);
      }
    };
  }, []);

  // Initialize map when script is loaded and map is visible
  useEffect(() => {
    if (isScriptLoaded && isVisible) {
      const timer = setTimeout(() => {
        initMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScriptLoaded, isVisible, initMap]);

  // Trigger map resize when container changes
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current && window.google) {
        setTimeout(() => {
          google.maps.event.trigger(mapInstanceRef.current, 'resize');
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  return (
    <div className="google-map-wrapper" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      minHeight: '500px'
    }}>
      <div
        ref={mapRef}
        className="google-map-container"
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
      
      {(!mapLoaded || !isScriptLoaded) && (
        <div className="map-loading-overlay" style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'rgba(248, 250, 252, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          zIndex: 1000
        }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px' 
          }}>
            {!isScriptLoaded ? 'Loading Google Maps...' : 'Initializing Map...'}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
              '⚠️ API Key Missing - Check .env file' : 
              'Setting up your map view...'}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleMap;