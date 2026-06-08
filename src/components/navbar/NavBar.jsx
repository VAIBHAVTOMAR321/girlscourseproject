import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';
import Logo from '../../assets/brainrock_logo.png';

const NavBar = () => {
  const location = useLocation();
  // isLoginPage should only be true for the /login path to allow the Login button to show on /employee
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/Registration';
  // Handle the trailing slash for GovtEmployee page
  const isGovtEmployeePage = location.pathname === '/GovtEmployee' || location.pathname === '/GovtEmployee/';
  // Check specifically for the employee login path
  const isEmployeePage = location.pathname === '/employee' || location.pathname === '/employee/';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {isGovtEmployeePage ? (
          <div className="navbar-logo">
            <img src={Logo} alt="BrainRock Logo" className="navbar-logo-img" />
            <div className="navbar-logo-text">
              <div className="navbar-logo-main">Brainrock Consulting Services</div>
              <div className="navbar-logo-sub">I.S.O certified 9001:2015</div>
            </div>
          </div>
        ) : (
          <Link to="/" className="navbar-logo">
            <img src={Logo} alt="BrainRock Logo" className="navbar-logo-img" />
            <div className="navbar-logo-text">
              <div className="navbar-logo-main">Brainrock Consulting Services</div>
              <div className="navbar-logo-sub">I.S.O certified 9001:2015</div>
            </div>
          </Link>
        )}
        
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
          {/* Hide Home on GovtEmployee and Employee login pages */}
          {!isGovtEmployeePage && !isEmployeePage && (
            <Link to="/" className="navbar-link">Home</Link>
          )}
          
          {/* Show Login button if not on a login page; redirect to /employee if on GovtEmployee page */}
          {!isLoginPage && (
            <Link 
              to={isEmployeePage ? "/GovtEmployee" : (isGovtEmployeePage ? "/employee" : "/login")} 
              className="navbar-link navbar-button"
            >
              {isEmployeePage ? "Test" : "Login"}
            </Link>
          )}
          {/* {!isRegisterPage && (
            <Link to="/Registration" className="navbar-link navbar-button">Register</Link>
          )} */}
        </div>
        
        {/* Mobile menu */}
        <div className={`navbar-mobile-menu ${menuOpen ? 'active' : ''}`}>
          {/* Hide Home on GovtEmployee and Employee login pages */}
          {!isGovtEmployeePage && !isEmployeePage && (
            <Link 
              to="/" 
              className="navbar-link" 
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          )}
          
          {!isLoginPage && (
            <Link 
              to={isEmployeePage ? "/GovtEmployee" : (isGovtEmployeePage ? "/employee" : "/login")} 
              className="navbar-link navbar-button" 
              onClick={() => setMenuOpen(false)}
            >
              {isEmployeePage ? "Test" : "Login"}
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