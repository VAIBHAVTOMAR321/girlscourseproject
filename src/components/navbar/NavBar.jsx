import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';
import Logo from '../../assets/brainrock_logo.png';

const NavBar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/Registration';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={Logo} alt="BrainRock Logo" className="navbar-logo-img" />
          <div className="navbar-logo-text">
            <div className="navbar-logo-main">Brainrock Consulting Services</div>
            <div className="navbar-logo-sub">I.S.O certified 9001:2015</div>
          </div>
        </Link>
        
        <div className="navbar-center">
          <h1 className="navbar-center-heading">National Education & Training Portal</h1>
        </div>
        
        {/* Mobile menu toggle */}
        <button 
          className="navbar-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
        </button>
        
        {/* Desktop menu */}
        <div className="navbar-menu">
          <Link to="#" className="navbar-link">Home</Link>
        
          {!isLoginPage && (
            <Link to="/login" className="navbar-link navbar-button">Login</Link>
          )}
          {!isRegisterPage && (
            <Link to="/Registration" className="navbar-link navbar-button">Register</Link>
          )}
        </div>
        
        {/* Mobile menu */}
        <div className={`navbar-mobile-menu ${menuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className="navbar-link" 
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
        
          {!isLoginPage && (
            <Link 
              to="/login" 
              className="navbar-link navbar-button" 
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
          {!isRegisterPage && (
            <Link 
              to="/Registration" 
              className="navbar-link navbar-button" 
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;