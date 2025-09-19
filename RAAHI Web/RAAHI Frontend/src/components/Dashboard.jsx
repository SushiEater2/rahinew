import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/modern-dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [safetyScore, setSafetyScore] = useState(85);
  const [currentLocation, setCurrentLocation] = useState('India Gate, New Delhi');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login.html');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Check if using mock authentication
      const token = localStorage.getItem('authToken');
      if (token && token.startsWith('mock-jwt-token-')) {
        // Use mock data
        const mockAlerts = [
          {
            id: '1',
            title: 'Weather Advisory',
            description: 'Heavy rain expected in your area. Carry umbrella.',
            severity: 'medium',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Tourist Safety Update',
            description: 'All major tourist attractions are safe and operational.',
            severity: 'low',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        
        setDashboardData(user);
        setAlerts(mockAlerts);
        setIsLoading(false);
        return;
      }
      
      // Try to load from backend
      try {
        const [profileData, alertsData] = await Promise.all([
          apiService.users.getProfile(),
          apiService.alerts.getAll()
        ]);
        
        setDashboardData(profileData);
        setAlerts(alertsData.alerts || []);
      } catch (apiError) {
        console.warn('Backend API not available, using user data from context:', apiError.message);
        setDashboardData(user);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login.html');
  };

  if (isLoading) {
    return (
      <section id="dashboard" className="page active">
        <div className="container">
          <div className="loading-spinner" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="dashboard" className="page active">
        <div className="container">
          <div className="error-message" style={{ color: '#ff4444', textAlign: 'center', padding: '2rem' }}>
            <p>{error}</p>
            <button onClick={loadDashboardData} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Top Navigation Bar */}
      <nav className="dashboard-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <h1 className="logo">RAAHI</h1>
            <span className="tagline">Smart Tourism</span>
          </div>
          
          <div className="navbar-actions">
            <div className="location-indicator">
              <svg className="location-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>{currentLocation}</span>
            </div>
            
            <div className="profile-dropdown" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
              <div className="profile-avatar">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=007bff&color=fff`} alt="Profile" />
              </div>
              <span className="profile-name">{user?.fullName}</span>
              <svg className="dropdown-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M7 10l5 5 5-5z"/>
              </svg>
              
              {showProfileDropdown && (
                <div className="dropdown-menu">
                  <a href="#profile" className="dropdown-item">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Profile
                  </a>
                  <a href="#settings" className="dropdown-item">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                    Settings
                  </a>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'tours' ? 'active' : ''}`}
              onClick={() => setActiveTab('tours')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              Tours
            </button>
            <button 
              className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20.5,3L20.34,3.03L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21L3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19.03 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z"/></svg>
              Safety Map
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="dashboard-grid">
                  {/* Digital ID Card */}
                  <div className="digital-id-card">
                    <div className="id-header">
                      <h3>Digital Tourist ID</h3>
                      <div className="blockchain-badge">
                        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/></svg>
                        Blockchain Verified
                      </div>
                    </div>
                    <div className="id-content">
                      <div className="id-main">
                        <div className="profile-section">
                          <img 
                            className="profile-image" 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=007bff&color=fff&size=80`}
                            alt="Profile"
                          />
                          <div className="profile-details">
                            <h4>{user?.fullName}</h4>
                            <p className="nationality">🇮🇳 Indian</p>
                            <p className="tourist-id">ID: {user?.touristId}</p>
                          </div>
                        </div>
                        <div className="qr-section">
                          <div className="qr-code">
                            <div className="qr-placeholder">
                              <svg viewBox="0 0 24 24" width="60" height="60">
                                <path fill="currentColor" d="M3,3H9V9H3V3M15,3H21V9H15V3M3,15H9V21H3V15M13,17V19H15V21H17V19H21V17H17V15H15V17H13M19,19V21H21V19H19M15,5V7H17V5H15M5,5V7H7V5H5M5,17V19H7V17H5Z"/>
                              </svg>
                            </div>
                          </div>
                          <p className="qr-text">Scan for verification</p>
                        </div>
                      </div>
                      <div className="emergency-contacts">
                        <h5>Emergency Contacts</h5>
                        <div className="contact-list">
                          <span>📞 +91-9876543210</span>
                          <span>🏥 Nearest Hospital: 2.3km</span>
                          <span>🚔 Police Station: 1.1km</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Score */}
                  <div className="safety-score-card">
                    <div className="card-header">
                      <h3>Safety Score</h3>
                      <div className="live-indicator">
                        <div className="pulse-dot"></div>
                        Live
                      </div>
                    </div>
                    <div className="score-display">
                      <div className="score-circle">
                        <svg className="progress-ring" width="120" height="120">
                          <circle 
                            className="progress-ring-circle" 
                            stroke="#e2e8f0" 
                            strokeWidth="8" 
                            fill="transparent" 
                            r="48" 
                            cx="60" 
                            cy="60"
                          />
                          <circle 
                            className="progress-ring-circle active" 
                            stroke={safetyScore >= 80 ? '#10b981' : safetyScore >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8" 
                            fill="transparent" 
                            r="48" 
                            cx="60" 
                            cy="60"
                            strokeDasharray={`${safetyScore * 3.01} 301.59`}
                            strokeDashoffset="0"
                          />
                        </svg>
                        <div className="score-text">
                          <span className="score-number">{safetyScore}</span>
                          <span className="score-label">Safe</span>
                        </div>
                      </div>
                      <div className="score-details">
                        <div className="score-factor positive">
                          <span className="factor-icon">✓</span>
                          <span>Low crime rate</span>
                        </div>
                        <div className="score-factor positive">
                          <span className="factor-icon">✓</span>
                          <span>Good weather conditions</span>
                        </div>
                        <div className="score-factor neutral">
                          <span className="factor-icon">⚠</span>
                          <span>Moderate crowd density</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="quick-stats">
                    <div className="stat-item">
                      <div className="stat-icon blue">
                        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                      </div>
                      <div className="stat-content">
                        <span className="stat-number">12</span>
                        <span className="stat-label">Places Visited</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon green">
                        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                      <div className="stat-content">
                        <span className="stat-number">4.8</span>
                        <span className="stat-label">Avg Rating</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon orange">
                        <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/></svg>
                      </div>
                      <div className="stat-content">
                        <span className="stat-number">24</span>
                        <span className="stat-label">Hours Travelled</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Alerts */}
                  <div className="alerts-card">
                    <div className="card-header">
                      <h3>Recent Alerts</h3>
                      <button className="view-all-btn">View All</button>
                    </div>
                    <div className="alerts-list">
                      {alerts.map((alert, index) => (
                        <div key={index} className={`alert-item ${alert.severity}`}>
                          <div className="alert-icon">
                            {alert.severity === 'high' && '🚨'}
                            {alert.severity === 'medium' && '⚠️'}
                            {alert.severity === 'low' && 'ℹ️'}
                          </div>
                          <div className="alert-content">
                            <h4>{alert.title}</h4>
                            <p>{alert.description}</p>
                            <span className="alert-time">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'tours' && (
              <div className="tours-tab">
                <div className="tour-timeline">
                  <h3>Your Tour History</h3>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>Red Fort</h4>
                        <p>Historical monument visit</p>
                        <span className="timeline-time">2 hours ago</span>
                        <div className="rating">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>India Gate</h4>
                        <p>War memorial visit</p>
                        <span className="timeline-time">5 hours ago</span>
                        <div className="rating">⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>Lotus Temple</h4>
                        <p>Spiritual visit</p>
                        <span className="timeline-time">Yesterday</span>
                        <div className="rating">⭐⭐⭐⭐⭐</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="recommendations">
                  <h3>Recommended for You</h3>
                  <div className="recommendations-grid">
                    <div className="recommendation-card">
                      <div className="rec-image">🏛️</div>
                      <div className="rec-content">
                        <h4>Qutub Minar</h4>
                        <p>Historic tower, 12km away</p>
                        <div className="rec-rating">4.6 ⭐</div>
                      </div>
                    </div>
                    <div className="recommendation-card">
                      <div className="rec-image">🍽️</div>
                      <div className="rec-content">
                        <h4>Karim's</h4>
                        <p>Traditional Mughlai cuisine</p>
                        <div className="rec-rating">4.8 ⭐</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="map-tab">
                <div className="map-safety-grid">
                  {/* Interactive Map Section */}
                  <div className="interactive-map-section">
                    <div className="map-header">
                      <h3>Interactive Safety Map</h3>
                      <div className="map-controls">
                        <button className="map-control-btn active">
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                          </svg>
                          Safety View
                        </button>
                        <button className="map-control-btn">
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,7H15V5A2,2 0 0,0 13,3H11A2,2 0 0,0 9,5V7H7L7.5,9L16.5,9L17,7M16,10H8V11A1,1 0 0,0 9,12H15A1,1 0 0,0 16,11V10Z"/>
                          </svg>
                          Services
                        </button>
                      </div>
                    </div>
                    
                    <div className="map-container">
                      <div className="interactive-map">
                        {/* Map Areas - Clickable zones */}
                        <div 
                          className="map-area safe-area" 
                          onClick={() => { setSafetyScore(92); setCurrentLocation('Connaught Place, New Delhi'); }}
                          title="Connaught Place - Very Safe"
                        >
                          <div className="area-label">Connaught Place</div>
                          <div className="safety-indicator safe">92</div>
                        </div>
                        
                        <div 
                          className="map-area moderate-area" 
                          onClick={() => { setSafetyScore(68); setCurrentLocation('Karol Bagh, New Delhi'); }}
                          title="Karol Bagh - Moderate Safety"
                        >
                          <div className="area-label">Karol Bagh</div>
                          <div className="safety-indicator moderate">68</div>
                        </div>
                        
                        <div 
                          className="map-area safe-area current-area" 
                          onClick={() => { setSafetyScore(85); setCurrentLocation('India Gate, New Delhi'); }}
                          title="India Gate - Safe (Your Location)"
                        >
                          <div className="area-label">India Gate</div>
                          <div className="safety-indicator safe">85</div>
                          <div className="current-location-pin">📍</div>
                        </div>
                        
                        <div 
                          className="map-area risky-area" 
                          onClick={() => { setSafetyScore(42); setCurrentLocation('Old Delhi, New Delhi'); }}
                          title="Old Delhi - High Risk"
                        >
                          <div className="area-label">Old Delhi</div>
                          <div className="safety-indicator risky">42</div>
                        </div>
                        
                        <div 
                          className="map-area safe-area" 
                          onClick={() => { setSafetyScore(88); setCurrentLocation('Dwarka, New Delhi'); }}
                          title="Dwarka - Very Safe"
                        >
                          <div className="area-label">Dwarka</div>
                          <div className="safety-indicator safe">88</div>
                        </div>
                        
                        <div 
                          className="map-area moderate-area" 
                          onClick={() => { setSafetyScore(73); setCurrentLocation('Lajpat Nagar, New Delhi'); }}
                          title="Lajpat Nagar - Moderate Safety"
                        >
                          <div className="area-label">Lajpat Nagar</div>
                          <div className="safety-indicator moderate">73</div>
                        </div>
                      </div>
                      
                      <div className="map-legend">
                        <div className="legend-item">
                          <div className="legend-color safe"></div>
                          <span>Safe Zones (80+)</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color moderate"></div>
                          <span>Moderate Risk (50-79)</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color risky"></div>
                          <span>High Risk (0-49)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Safety Score Section */}
                  <div className="area-safety-section">
                    <div className="safety-score-header">
                      <h3>Area Safety Score</h3>
                      <div className="live-indicator">
                        <div className="pulse-dot"></div>
                        Live Updates
                      </div>
                    </div>
                    
                    <div className="safety-score-display">
                      <div className="score-circle">
                        <svg className="progress-ring" width="140" height="140">
                          <circle 
                            className="progress-ring-circle" 
                            stroke="#e2e8f0" 
                            strokeWidth="10" 
                            fill="transparent" 
                            r="55" 
                            cx="70" 
                            cy="70"
                          />
                          <circle 
                            className="progress-ring-circle active" 
                            stroke={safetyScore >= 80 ? '#10b981' : safetyScore >= 50 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="10" 
                            fill="transparent" 
                            r="55" 
                            cx="70" 
                            cy="70"
                            strokeDasharray={`${safetyScore * 3.45} 345.58`}
                            strokeDashoffset="0"
                          />
                        </svg>
                        <div className="score-text">
                          <span className="score-number">{safetyScore}</span>
                          <span className="score-label">
                            {safetyScore >= 80 ? 'Very Safe' : safetyScore >= 50 ? 'Moderate' : 'High Risk'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="area-details">
                        <div className="current-area-info">
                          <h4>Current Area: {currentLocation}</h4>
                          <p className="area-description">
                            {safetyScore >= 80 && "This area is considered very safe with low crime rates and good infrastructure."}
                            {safetyScore >= 50 && safetyScore < 80 && "This area has moderate safety levels. Stay alert and follow basic precautions."}
                            {safetyScore < 50 && "High risk area. Exercise extreme caution and consider alternative routes."}
                          </p>
                        </div>
                        
                        <div className="safety-factors">
                          <div className="factor-grid">
                            <div className={`factor-item ${safetyScore >= 80 ? 'positive' : safetyScore >= 50 ? 'neutral' : 'negative'}`}>
                              <span className="factor-icon">
                                {safetyScore >= 80 ? '✓' : safetyScore >= 50 ? '⚠' : '❌'}
                              </span>
                              <div className="factor-content">
                                <span className="factor-label">Crime Rate</span>
                                <span className="factor-value">
                                  {safetyScore >= 80 ? 'Low' : safetyScore >= 50 ? 'Moderate' : 'High'}
                                </span>
                              </div>
                            </div>
                            
                            <div className={`factor-item ${safetyScore >= 70 ? 'positive' : safetyScore >= 40 ? 'neutral' : 'negative'}`}>
                              <span className="factor-icon">
                                {safetyScore >= 70 ? '✓' : safetyScore >= 40 ? '⚠' : '❌'}
                              </span>
                              <div className="factor-content">
                                <span className="factor-label">Crowd Density</span>
                                <span className="factor-value">
                                  {safetyScore >= 70 ? 'Normal' : safetyScore >= 40 ? 'High' : 'Very High'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="factor-item positive">
                              <span className="factor-icon">✓</span>
                              <div className="factor-content">
                                <span className="factor-label">Weather</span>
                                <span className="factor-value">Good</span>
                              </div>
                            </div>
                            
                            <div className={`factor-item ${safetyScore >= 75 ? 'positive' : safetyScore >= 45 ? 'neutral' : 'negative'}`}>
                              <span className="factor-icon">
                                {safetyScore >= 75 ? '✓' : safetyScore >= 45 ? '⚠' : '❌'}
                              </span>
                              <div className="factor-content">
                                <span className="factor-label">Emergency Response</span>
                                <span className="factor-value">
                                  {safetyScore >= 75 ? 'Excellent' : safetyScore >= 45 ? 'Good' : 'Limited'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Nearby Services */}
                    <div className="nearby-services">
                      <h4>Nearby Emergency Services</h4>
                      <div className="services-grid">
                        <div className="service-item">
                          <span className="service-icon">🏥</span>
                          <div className="service-info">
                            <span className="service-name">AIIMS Hospital</span>
                            <span className="service-distance">2.3 km</span>
                          </div>
                        </div>
                        <div className="service-item">
                          <span className="service-icon">🚔</span>
                          <div className="service-info">
                            <span className="service-name">CP Police Station</span>
                            <span className="service-distance">1.1 km</span>
                          </div>
                        </div>
                        <div className="service-item">
                          <span className="service-icon">🚑</span>
                          <div className="service-info">
                            <span className="service-name">Fire Station</span>
                            <span className="service-distance">1.8 km</span>
                          </div>
                        </div>
                        <div className="service-item">
                          <span className="service-icon">🚇</span>
                          <div className="service-info">
                            <span className="service-name">Rajiv Chowk Metro</span>
                            <span className="service-distance">0.5 km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* SOS Button - Fixed Position */}
      <button className="sos-button">
        <div className="sos-pulse"></div>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.08 5.74-.08 5.74s-.12 1.10-.24 1.26c-.12.16-.36.22-.60.22-.24 0-.48-.06-.6-.22-.12-.16-.24-1.26-.24-1.26s.07-4.16-.08-5.74c-.06-.65.21-1.14.86-1.26 1.02-.18 1.82.26 1.98 1.26zM12 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
        <span>SOS</span>
      </button>
    </div>
  );
};

export default Dashboard;