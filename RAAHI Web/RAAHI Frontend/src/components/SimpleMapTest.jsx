import React, { useRef, useEffect, useState } from 'react';

const SimpleMapTest = () => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: 28.6129, lng: 77.2295 }, // India Gate
        mapTypeId: 'roadmap',
      });
      
      setMapLoaded(true);
      console.log('Simple map loaded successfully');
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.onload = initMap;
      script.onerror = () => console.error('Failed to load Google Maps');
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple Map Test</h2>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      />
      <p>Map Status: {mapLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
    </div>
  );
};

export default SimpleMapTest;