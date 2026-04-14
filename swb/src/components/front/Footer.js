import React from 'react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>Copyright © 2026 V&T</p>
        <div className="footer-links">
          <span>All Rights Reserved</span> | 
          <a href="#terms">Terms and Conditions</a> | 
          <a href="#privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;