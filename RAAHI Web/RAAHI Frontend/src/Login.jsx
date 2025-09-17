import React, { useState, useEffect } from 'react';
import './styles/login.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('tourist');
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    // Add/remove light-mode class on body
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
  };

  const toggleMode = () => {
    setIsLightMode(!isLightMode);
  };

  return (
    <div className="login-page">
      <button className="mode-btn" onClick={toggleMode}>{isLightMode ? '☀️' : '🌙'}</button>
      <div className="login-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'tourist' ? 'active' : ''}`} onClick={() => switchTab('tourist')}>Tourist</button>
          <button className={`tab ${activeTab === 'police' ? 'active' : ''}`} onClick={() => switchTab('police')}>Police</button>
          <button className={`tab ${activeTab === 'department' ? 'active' : ''}`} onClick={() => switchTab('department')}>Tourism Dept</button>
        </div>
        <form id="tourist" className={`form ${activeTab === 'tourist' ? 'active' : ''}`}>
          <h2>Tourist Login</h2>
          <div className="input-group">
            <label htmlFor="aadhaar">Aadhaar Number</label>
            <input type="text" id="aadhaar" placeholder="Enter Aadhaar Number" required pattern="[0-9]{12}" />
          </div>
          <div className="input-group">
            <label htmlFor="t-password">Password</label>
            <input type="password" id="t-password" placeholder="Enter Password" required />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <form id="police" className={`form ${activeTab === 'police' ? 'active' : ''}`}>
          <h2>Police Login</h2>
          <div className="input-group">
            <label htmlFor="pincode">Pincode</label>
            <input type="text" id="pincode" placeholder="Enter Pincode" required pattern="[0-9]{6}" />
          </div>
          <div className="input-group">
            <label htmlFor="p-password">Password</label>
            <input type="password" id="p-password" placeholder="Enter Password" required />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <form id="department" className={`form ${activeTab === 'department' ? 'active' : ''}`}>
          <h2>Tourism Dept Login</h2>
          <div className="input-group">
            <label htmlFor="state">State</label>
            <select id="state" required>
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
            <input type="password" id="d-password" placeholder="Enter Password" required />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;