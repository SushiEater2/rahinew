import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Shared/Header';
import Footer from './components/Shared/Footer';
import PanicButton from './components/Shared/PanicButton';
import Chatbot from './components/Shared/Chatbot';
import Home from './components/Home';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import Help from './components/Help';
import Admin from './components/Admin';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkTheme(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fullscreen functionality with scroll preservation
  useEffect(() => {
    const requestFullscreen = () => {
      const element = document.documentElement;
      
      // Check if fullscreen is supported and not already in fullscreen
      if (
        (document.fullscreenElement || 
         document.webkitFullscreenElement || 
         document.mozFullScreenElement || 
         document.msFullscreenElement) === null
      ) {
        // Try to request fullscreen with different browser prefixes
        if (element.requestFullscreen) {
          element.requestFullscreen().then(() => {
            // Ensure scrolling is maintained after fullscreen
            document.documentElement.style.overflowY = 'auto';
            document.body.style.overflowY = 'auto';
          }).catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
          document.documentElement.style.overflowY = 'auto';
          document.body.style.overflowY = 'auto';
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
          document.documentElement.style.overflowY = 'auto';
          document.body.style.overflowY = 'auto';
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
          document.documentElement.style.overflowY = 'auto';
          document.body.style.overflowY = 'auto';
        }
      }
    };

    // Request fullscreen on first user interaction
    const handleFirstInteraction = () => {
      requestFullscreen();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    // Also listen for fullscreen changes to ensure scroll is preserved
    const handleFullscreenChange = () => {
      document.documentElement.style.overflowY = 'auto';
      document.body.style.overflowY = 'auto';
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handlePageChange = (pageId) => {
    // Check if trying to access dashboard - always redirect to login
    if (pageId === 'dashboard') {
      // Redirect directly to login page
      window.location.href = '/login.html';
      return;
    }
    
    setCurrentPage(pageId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onPageChange={handlePageChange} />;
      case 'register':
        return <Registration />;
      case 'dashboard':
        return <Dashboard />;
      case 'alerts':
        return <Alerts />;
      case 'help':
        return <Help />;
      case 'admin':
        return <Admin />;
      default:
        return <Home onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="app-container">
      <Header onPageChange={handlePageChange} currentPage={currentPage} />
      <main className="main">
        {renderPage()}
      </main>
      <Footer />
      <PanicButton />
      <Chatbot />
      
      {/* Theme Toggle Button */}
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        <span className="theme-toggle-icon">
          {isDarkTheme ? '☀️' : '🌙'}
        </span>
      </button>
    </div>
  );
};

export default App;