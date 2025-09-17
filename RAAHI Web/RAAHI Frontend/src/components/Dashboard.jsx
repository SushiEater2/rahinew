import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
      
      // Load user profile and alerts in parallel
      const [profileData, alertsData] = await Promise.all([
        apiService.users.getProfile(),
        apiService.alerts.getAll()
      ]);
      
      setDashboardData(profileData);
      setAlerts(alertsData.alerts || []);
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
    <section id="dashboard" className="page active">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.fullName || 'Tourist'}!</h1>
          <p>Your personal safety dashboard and digital ID.</p>
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>
        
        <div className="dashboard-grid">
          {/* User Profile Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Your Profile</h3>
            </div>
            <div className="card-content">
              {user && (
                <div className="profile-info">
                  <p><strong>Name:</strong> {user.fullName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                  <p><strong>Tourist ID:</strong> {user.touristId || 'Pending'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Active Alerts</h3>
            </div>
            <div className="card-content">
              {alerts.length > 0 ? (
                <ul className="alerts-list">
                  {alerts.slice(0, 5).map((alert, index) => (
                    <li key={index} className={`alert-item ${alert.severity}`}>
                      <strong>{alert.title}</strong>
                      <p>{alert.description}</p>
                      <small>{new Date(alert.createdAt).toLocaleDateString()}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No active alerts in your area. Stay safe!</p>
              )}
            </div>
          </div>

          {/* Safety Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Safety Status</h3>
            </div>
            <div className="card-content">
              <div className="safety-status">
                <div className="status-indicator green">✓</div>
                <p>Your current area is considered safe</p>
                <small>Last updated: {new Date().toLocaleString()}</small>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content">
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={() => navigate('/alerts')}>View All Alerts</button>
                <button className="btn btn-outline" onClick={() => navigate('/help')}>Get Help</button>
                <button className="btn btn-success" onClick={loadDashboardData}>Refresh Data</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;