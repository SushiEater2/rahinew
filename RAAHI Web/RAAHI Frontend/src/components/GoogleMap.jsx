import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/google-maps.css';

const GoogleMap = ({ 
  onLocationUpdate, 
  safetyData = [], 
  emergencyServices = [], 
  touristAttractions = [] 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circlesRef = useRef([]);
  const [userLocation, setUserLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Cleanup function
  const cleanupMap = useCallback(() => {
    // Clear all markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Clear all circles
    circlesRef.current.forEach(circle => circle.setMap(null));
    circlesRef.current = [];
  }, []);

  // Initialize Google Map
  const initMap = useCallback(() => {
    if (!window.google || !mapRef.current || !isScriptLoaded) {
      console.warn('Google Maps API not ready or mapRef not available');
      return;
    }

    try {
      // Cleanup any existing markers/circles
      cleanupMap();

      // Default location (India Gate, New Delhi)
      const defaultLocation = { lat: 28.6129, lng: 77.2295 };
      
      const mapOptions = {
        zoom: 12,
        center: defaultLocation,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
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
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{"visibility": "simplified"}]
          }
        ]
      };

      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Wait for map to be fully loaded
      google.maps.event.addListenerOnce(map, 'idle', () => {
        setMapLoaded(true);
        console.log('Map fully loaded and ready');
      });

      // Add resize listener to handle container changes
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
            // Fallback to default location
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
    } catch (error) {
      console.error('Error initializing map:', error);
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

    console.log('Loading Google Maps API...');
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
      console.error('Please check your API key and network connection.');
    };
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      script.remove();
    };
  }, []);

  // Intersection Observer to detect when map becomes visible
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
      }, 100); // Small delay to ensure DOM is ready
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
    const currentMarkers = [];
    const currentCircles = [];

    safetyZones.forEach(zone => {
      try {
        // Create safety zone circle
        const safetyCircle = new window.google.maps.Circle({
          strokeColor: zone.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: zone.color,
          fillOpacity: 0.35,
          map: map,
          center: { lat: zone.lat, lng: zone.lng },
          radius: 1000,
          clickable: false
        });
        currentCircles.push(safetyCircle);

        // Create marker for safety zone using symbol path
        const marker = new window.google.maps.Marker({
          position: { lat: zone.lat, lng: zone.lng },
          map: map,
          title: `${zone.name} - Safety Score: ${zone.safety}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: zone.color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 16,
            labelOrigin: new google.maps.Point(0, 0)
          },
          label: {
            text: zone.safety.toString(),
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });
        currentMarkers.push(marker);

        // Info window for safety zone
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">${zone.name}</h3>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="
                  background: ${zone.color}; 
                  color: white; 
                  padding: 6px 12px; 
                  border-radius: 20px; 
                  font-weight: bold;
                  font-size: 14px;
                ">
                  Safety Score: ${zone.safety}
                </div>
              </div>
              <p style="margin: 0; color: #666; font-size: 14px;">
                ${zone.safety >= 80 ? '🟢 Very Safe Area' : 
                  zone.safety >= 50 ? '🟡 Moderate Safety' : '🔴 High Risk Area'}
              </p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      } catch (error) {
        console.error('Error creating safety zone:', zone.name, error);
      }
    });

    // Store references for cleanup
    markersRef.current.push(...currentMarkers);
    circlesRef.current.push(...currentCircles);

    return () => {
      currentMarkers.forEach(marker => marker.setMap(null));
      currentCircles.forEach(circle => circle.setMap(null));
    };
  }, [mapLoaded, safetyData]);

  // Emergency services and tourist attractions will be added in future updates
  // Keeping the map simple for now to prevent conflicts

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
              'Connecting to Google Maps API...'}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .google-map-container {
          transition: opacity 0.3s ease-in-out;
        }
        .google-map-container.loading {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default GoogleMap;