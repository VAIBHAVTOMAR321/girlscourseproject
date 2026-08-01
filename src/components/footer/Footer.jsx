import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import "../../assets/css/Footer.css";

function Footer() {
  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <h4>Digital Saksham Beti</h4>
          <p>Empowering girls across the nation with essential digital skills for a brighter future.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#courses">Courses</a></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>Email: contact@digitalsakshambeti.org</p>
          <p>Phone: +91 12345 67890</p>
        </div>
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Digital Saksham Beti. All Rights Reserved.</p>
        <ul>
          <li><Link to="/privacy-policy">Privacy Policy</Link></li>
          <li><Link to="/terms-of-service">Terms of Service</Link></li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
