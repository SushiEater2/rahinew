import React from 'react';

const Dashboard = () => {
  return (
    <section id="dashboard" className="page active">
      <div className="container">
        <h1>Tourist Dashboard</h1>
        <p>Your personal safety dashboard and digital ID.</p>
        <div className="placeholder-content">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Coming Soon</h3>
            </div>
            <div className="card-content">
              <p>Your personalized dashboard will display:</p>
              <ul>
                <li>Current location safety status</li>
                <li>Active alerts for your area</li>
                <li>Your digital Tourist ID</li>
                <li>Emergency contacts</li>
                <li>Recent activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;