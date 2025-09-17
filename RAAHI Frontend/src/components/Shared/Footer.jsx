import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Smart Tourist Safety</h3>
            <p>Government-backed initiative for tourist safety and monitoring.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home" data-page="home">Home</a></li>
              <li><a href="#register" data-page="register">Register</a></li>
              <li><a href="#help" data-page="help">Help</a></li>
              <li><a href="#" className="link">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Emergency</h4>
            <ul className="footer-links">
              <li><a href="tel:100">Police: 100</a></li>
              <li><a href="tel:108">Ambulance: 108</a></li>
              <li><a href="tel:1363">Tourist Helpline: 1363</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Smart Tourist Safety System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;