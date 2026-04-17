import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';


import ProfileIcon from '../images/user.png'; 
import UploadIcon from '../images/upload.png';
import ResultIcon from '../images/research.png';

const Sidebar = ({ isOpen, onClose, isLoggedIn }) => {
  return (
    <>

      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      
     
      <div className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            
            <img src={ProfileIcon} alt="Profile" className="profile-icon-img" />
            <span>{isLoggedIn ? 'MENU' : '비회원 MENU'}</span>
          </div>
        </div>
        
        <nav className="sidebar-content">
          <ul>
            {isLoggedIn && (
              <li>
                <img src={ProfileIcon} alt="Profile" className="menu-icon-img" />
                <Link to="/profile" onClick={onClose}>내 프로필</Link>
              </li>
            )}
            <li>
              <img src={UploadIcon} alt="Upload" className="menu-icon-img" />
              <Link to="/upload" onClick={onClose}>파일 업로드</Link>
            </li>
            <li>
              <img src={ResultIcon} alt="Result" className="menu-icon-img" />
              <a href="#result">분석 결과 확인</a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>Copyright © 2026 V&T</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;