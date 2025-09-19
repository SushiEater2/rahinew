import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './styles/login.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('tourist');
  const [isLightMode, setIsLightMode] = useState(false);
  const [formData, setFormData] = useState({
    tourist: { email: '', password: '' },
    police: { pincode: '', password: '' },
    department: { state: '', password: '' }
  });
  const [errors, setErrors] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clean up any previous body classes on component mount and unmount
    return () => {
      document.body.classList.remove('light-mode');
    };
  }, []);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
  };

  const toggleMode = () => {
    setIsLightMode(!isLightMode);
  };

  const handleInputChange = (tab, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
    // Clear errors when user starts typing
    if (errors) setErrors('');
  };

  const handleSubmit = async (e, userType) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors('');

    try {
      const currentData = formData[userType];
      
      // Prepare login credentials based on user type
      let credentials = {
        userType,
        password: currentData.password
      };

      // Add specific identifier based on user type
      if (userType === 'tourist') {
        credentials.email = currentData.email;
      } else if (userType === 'police') {
        credentials.pincode = currentData.pincode;
      } else if (userType === 'department') {
        credentials.state = currentData.state;
      }

      const result = await login(credentials);
      
      if (result.success) {
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        setErrors(result.error || 'Login failed');
      }
    } catch (error) {
      setErrors('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`login-page ${isLightMode ? 'light-mode' : ''}`}>
      <button className="mode-btn" onClick={toggleMode}>{isLightMode ? '☀️' : '🌙'}</button>
      <div className="login-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'tourist' ? 'active' : ''}`} onClick={() => switchTab('tourist')}>Tourist</button>
          <button className={`tab ${activeTab === 'police' ? 'active' : ''}`} onClick={() => switchTab('police')}>Police</button>
          <button className={`tab ${activeTab === 'department' ? 'active' : ''}`} onClick={() => switchTab('department')}>Tourism Dept</button>
        </div>
        
        {errors && (
          <div className="error-message" style={{ color: '#ff4444', textAlign: 'center', marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255, 68, 68, 0.1)', borderRadius: '4px' }}>
            {errors}
          </div>
        )}
        <form id="tourist" className={`form ${activeTab === 'tourist' ? 'active' : ''}`} onSubmit={(e) => handleSubmit(e, 'tourist')}>
          <h2>Tourist Login</h2>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email address" 
              required 
              value={formData.tourist.email}
              onChange={(e) => handleInputChange('tourist', 'email', e.target.value)}
              disabled={isSubmitting || isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="t-password">Password</label>
            <input 
              type="password" 
              id="t-password" 
              placeholder="Enter Password" 
              required 
              value={formData.tourist.password}
              onChange={(e) => handleInputChange('tourist', 'password', e.target.value)}
              disabled={isSubmitting || isLoading}
            />
          </div>
          <button type="submit" className="login-btn" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem' }}>
            Don't have an account? <a href="/register" style={{ color: '#4CAF50' }}>Register here</a>
          </p>
        </form>
        <form id="police" className={`form ${activeTab === 'police' ? 'active' : ''}`} onSubmit={(e) => handleSubmit(e, 'police')}>
          <h2>Police Login</h2>
          <div className="input-group">
            <label htmlFor="pincode">Pincode</label>
            <input 
              type="text" 
              id="pincode" 
              placeholder="Enter Pincode" 
              required 
              pattern="[0-9]{6}" 
              value={formData.police.pincode}
              onChange={(e) => handleInputChange('police', 'pincode', e.target.value)}
              disabled={isSubmitting || isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="p-password">Password</label>
            <input 
              type="password" 
              id="p-password" 
              placeholder="Enter Password" 
              required 
              value={formData.police.password}
              onChange={(e) => handleInputChange('police', 'password', e.target.value)}
              disabled={isSubmitting || isLoading}
            />
          </div>
          <button type="submit" className="login-btn" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <form id="department" className={`form ${activeTab === 'department' ? 'active' : ''}`} onSubmit={(e) => handleSubmit(e, 'department')}>
          <h2>Tourism Dept Login</h2>
          <div className="input-group">
            <label htmlFor="state">State</label>
            <select 
              id="state" 
              required
              value={formData.department.state}
              onChange={(e) => handleInputChange('department', 'state', e.target.value)}
              disabled={isSubmitting || isLoading}
            >
              <option value="">Select State</option>
              <option>Andhra Pradesh</option>
              <option>Arunachal Pradesh</option>
              <option>Assam</option>
              <option>Bihar</option>
              <option>Chhattisgarh</option>
              <option>Goa</option>
              <option>Gujarat</option>
              <option>Haryana</option>
              <option>Himachal Pradesh</option>
              <option>Jharkhand</option>
              <option>Karnataka</option>
              <option>Kerala</option>
              <option>Madhya Pradesh</option>
              <option>Maharashtra</option>
              <option>Manipur</option>
              <option>Meghalaya</option>
              <option>Mizoram</option>
              <option>Nagaland</option>
              <option>Odisha</option>
              <option>Punjab</option>
              <option>Rajasthan</option>
              <option>Sikkim</option>
              <option>Tamil Nadu</option>
              <option>Telangana</option>
              <option>Tripura</option>
              <option>Uttar Pradesh</option>
              <option>Uttarakhand</option>
              <option>West Bengal</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="d-password">Password</label>
            <input 
              type="password" 
              id="d-password" 
              placeholder="Enter Password" 
              required 
              value={formData.department.password}
              onChange={(e) => handleInputChange('department', 'password', e.target.value)}
              disabled={isSubmitting || isLoading}
            />
          </div>
          <button type="submit" className="login-btn" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;