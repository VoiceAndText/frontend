import React, { useState } from 'react';
import '../css/Header.css';
import Sidebar from './Sidebar'; 
import Logo from '../images/Logo.png';


import HomeIcon from '../images/home.png'; 
import LoginIcon from '../images/profile.png';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            
            <div className="menu-icon" onClick={toggleSidebar}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="logo">
              <img src={Logo} alt="V&T Logo" className="logo-image" />
            </div>
          </div>

          <nav className="header-nav">
            
            <a href="#home" className="nav-item">
              <img src={HomeIcon} alt="Home" className="nav-icon" />
              <span>Home</span>
            </a>

           
            <button className="login-btn">
              <img src={LoginIcon} alt="Login" className="lock-icon-img" />
              Login
            </button>
          </nav>
        </div>
      </header>

      
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </>
  );
};

export default Header;