import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const PanicButton = () => {
  const [isWarning, setIsWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isTriggering, setIsTriggering] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [locationStatus, setLocationStatus] = useState('checking');
  const countdownRef = useRef(null);
  const { user } = useAuth();

  // Clean up countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const startWarningCountdown = () => {
    if (isWarning || hasTriggered) return;
    
    setIsWarning(true);
    setCountdown(30);
    setLocationStatus('checking');
    
    // Check location availability when warning starts
    checkLocationAvailability();
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          triggerPanicAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelPanic = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setIsWarning(false);
    setCountdown(30);
    setLocationStatus('checking');
  };

  const checkLocationAvailability = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus(`available: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setLocationStatus('unavailable: ' + error.message);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setLocationStatus('not supported');
    }
  };

  const triggerPanicAlert = async () => {
    setIsTriggering(true);
    setIsWarning(false);
    
    try {
      // Get user's location
      console.log('📍 Requesting user location...');
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true
            });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy
          };
          console.log(`✅ Location acquired: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} (±${location.accuracy.toFixed(0)}m)`);
        } catch (error) {
          console.warn('⚠️ Could not get precise location:', error.message);
          // Use approximate location if available
          location = {
            latitude: null,
            longitude: null,
            timestamp: new Date().toISOString(),
            error: 'Location access denied or unavailable'
          };
          console.log('❌ Using fallback location (0, 0)');
        }
      } else {
        console.warn('❌ Geolocation not supported by this browser');
        location = {
          latitude: null,
          longitude: null,
          timestamp: new Date().toISOString(),
          error: 'Geolocation not supported'
        };
      }
      
      // Send panic alert through backend API to Firebase Admin
      console.log('🚨 Sending panic alert through backend API...');
      
      // Prepare panic data for backend
      const panicData = {
        email: user?.email || 'anonymous@guest.com',
        location: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0
        },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        status: 'active',
        userId: user?.id || null
      };
      
      console.log('📍 Final panic data being sent:', {
        ...panicData,
        locationStatus: location?.latitude && location?.longitude ? 'PRECISE_LOCATION' : 'FALLBACK_LOCATION',
        locationAccuracy: location?.accuracy ? `±${location.accuracy.toFixed(0)}m` : 'Unknown'
      });
      
      // Send through backend API
      const response = await apiService.emergency.triggerPanic(panicData);
      
      console.log('✅ Backend response:', response);
      
      if (response && response.success) {
        // Show success message with location details
        const locationInfo = response.location.latitude && response.location.longitude
          ? `📍 LOCATION SENT: ${response.location.latitude.toFixed(6)}, ${response.location.longitude.toFixed(6)}`
          : '⚠️ LOCATION: Unable to capture precise location';
        
        const alertMsg = `🚨 EMERGENCY ALERT SENT!\n\n${locationInfo}\n\n✅ Alert ID: ${response.alertId}\n👤 User ID: ${response.userId}\n🗂️ Saved to: ${response.firestorePath}\n\n📞 Emergency services notified via Firebase!`;
        alert(alertMsg);
        
        // Also log to console for debugging
        console.log('🚨 PANIC ALERT SENT WITH LOCATION:', {
          alertId: response.alertId,
          location: response.location,
          firestorePath: response.firestorePath,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(response?.message || 'Unknown error occurred');
      }
      
      setHasTriggered(true);
      
      // Make the emergency call
      window.location.href = 'tel:112';
      
    } catch (error) {
      console.error('Failed to send panic alert:', error);
      // Still make the emergency call even if backend fails
      window.location.href = 'tel:112';
      setHasTriggered(true);
    } finally {
      setIsTriggering(false);
      
      // Reset after 2 minutes
      setTimeout(() => {
        setHasTriggered(false);
      }, 120000);
    }
  };

  return (
    <>
      <div className="panic-button">
        <button 
          onClick={startWarningCountdown} 
          className={`panic-btn ${hasTriggered ? 'triggered' : ''} ${isWarning ? 'warning' : ''}`}
          aria-label="Emergency panic button"
          disabled={isTriggering || isWarning}
          style={{ 
            backgroundColor: hasTriggered ? '#28a745' : isWarning ? '#ffa500' : '#dc3545',
            opacity: isTriggering ? 0.7 : 1,
            cursor: (isTriggering || isWarning) ? 'not-allowed' : 'pointer',
            transform: isWarning ? 'scale(1.1)' : 'scale(1)',
            animation: isWarning ? 'pulse 1s infinite' : 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
          <span>
            {isTriggering ? 'Sending...' : hasTriggered ? 'Alert Sent' : isWarning ? countdown : 'PANIC'}
          </span>
        </button>
      </div>

      {/* Warning Modal */}
      {isWarning && (
        <div className="panic-warning-overlay">
          <div className="panic-warning-modal">
            <div className="warning-icon">⚠️</div>
            <h3>Emergency Alert Warning</h3>
            <p>You accidentally activated the panic button?</p>
            <div className="countdown-display">
              <div className="countdown-circle">
                <span className="countdown-number">{countdown}</span>
              </div>
              <p>Emergency alert will be sent in <strong>{countdown}</strong> seconds</p>
            </div>
            <div className="warning-actions">
              <button 
                onClick={cancelPanic}
                className="cancel-btn"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                ✅ Cancel Alert
              </button>
              <button 
                onClick={triggerPanicAlert}
                className="confirm-btn"
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🚨 Send Now
              </button>
            </div>
            <div className="location-status" style={{ 
              margin: '15px 0', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px', 
              fontSize: '12px' 
            }}>
              <p><strong>📍 Location Status:</strong></p>
              <p style={{ 
                color: locationStatus.includes('available') ? '#28a745' : 
                       locationStatus.includes('unavailable') ? '#dc3545' : '#ffc107',
                fontFamily: 'monospace',
                marginTop: '5px'
              }}>
                {locationStatus === 'checking' ? 'Checking GPS...' : locationStatus}
              </p>
            </div>
            <p className="warning-note">
              Your location will be sent to emergency services and saved to our database.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .panic-warning-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(5px);
        }
        
        .panic-warning-modal {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          max-width: 400px;
          width: 90%;
          animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .warning-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .panic-warning-modal h3 {
          color: #dc3545;
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        
        .countdown-display {
          margin: 30px 0;
        }
        
        .countdown-circle {
          width: 80px;
          height: 80px;
          border: 4px solid #dc3545;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 15px;
          background: linear-gradient(135deg, #ff6b6b, #dc3545);
        }
        
        .countdown-number {
          font-size: 28px;
          font-weight: bold;
          color: white;
        }
        
        .warning-actions {
          margin: 30px 0 20px;
        }
        
        .warning-note {
          font-size: 12px;
          color: #666;
          margin-top: 15px;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
};

export default PanicButton;