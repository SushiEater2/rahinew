import React, { useState } from 'react';
import apiService from '../../services/api';

const PanicButton = () => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const triggerPanic = async () => {
    if (isTriggering || hasTriggered) return;
    
    setIsTriggering(true);
    
    try {
      // Get user's location if available
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('Could not get location:', error);
        }
      }
      
      // Send panic signal to backend
      await apiService.emergency.triggerPanic(location);
      
      setHasTriggered(true);
      
      // Also make the emergency call
      window.location.href = 'tel:112';
      
    } catch (error) {
      console.error('Failed to trigger panic alert:', error);
      // Still make the call even if API fails
      window.location.href = 'tel:112';
    } finally {
      setIsTriggering(false);
      
      // Reset the triggered state after some time
      setTimeout(() => {
        setHasTriggered(false);
      }, 30000); // 30 seconds
    }
  };

  return (
    <div className="panic-button">
      <button 
        onClick={triggerPanic} 
        className={`panic-btn ${hasTriggered ? 'triggered' : ''}`}
        aria-label="Emergency call 112"
        disabled={isTriggering}
        style={{ 
          backgroundColor: hasTriggered ? '#28a745' : '#dc3545',
          opacity: isTriggering ? 0.7 : 1,
          cursor: isTriggering ? 'wait' : 'pointer'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 
                   19.79 19.79 0 0 1-8.63-3.07 
                   19.5 19.5 0 0 1-6-6 
                   19.79 19.79 0 0 1-3.07-8.67
                   A2 2 0 0 1 4.11 2h3a2 2 0 0 1 
                   2 1.72 12.84 12.84 0 0 0 
                   .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91
                   a16 16 0 0 0 6 6l1.27-1.27
                   a2 2 0 0 1 2.11-.45 12.84 12.84 
                   0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span>
          {isTriggering ? 'Calling...' : hasTriggered ? 'Called' : 'Panic'}
        </span>
      </button>
    </div>
  );
};

export default PanicButton;