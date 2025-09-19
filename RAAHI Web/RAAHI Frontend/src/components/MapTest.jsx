import React, { useEffect } from 'react';

const MapTest = () => {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    
    // Test API call
    const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    console.log('Google Maps URL:', testUrl);
    
    window.initMap = () => {
      console.log('✅ Google Maps API is working!');
    };
    
    const script = document.createElement('script');
    script.src = testUrl;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      console.error('❌ Google Maps API failed to load:', error);
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Google Maps API Test</h3>
      <p>Check the console for test results...</p>
      <div>
        <strong>API Key Status:</strong> {
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
          `✅ Present (${import.meta.env.VITE_GOOGLE_MAPS_API_KEY.length} chars)` : 
          '❌ Missing'
        }
      </div>
    </div>
  );
};

export default MapTest;