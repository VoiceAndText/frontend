import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Sidebar.css';

import ProfileIcon from '../images/user.png'; 
import UploadIcon from '../images/upload.png';
import ResultIcon from '../images/research.png';
import AdminIcon from '../images/admin_main.png'; 
import DashIcon from '../images/admin_dash.png';
import LogIcon from '../images/admin_log.png';
import UserIcon from '../images/admin_user.png';

const Sidebar = ({ isOpen, onClose, isLoggedIn }) => {
  // 테스트용 관리자 상태
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAdminMenuOpen(false);
    }
  }, [isOpen]);

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

            {isLoggedIn && isAdminMode && (
              <li className={`admin-menu-li ${isAdminMenuOpen ? 'active' : ''}`}>
                <div className="menu-item-wrapper" onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}>
                  <div className="menu-item-main">
                    <img src={AdminIcon} alt="Admin" className="menu-icon-img" />
                    <span>관리자 메뉴</span>
                  </div>
                  <span className="admin-arrow">{isAdminMenuOpen ? '▲' : '▼'}</span>
                </div>
                
                <ul className={`admin-submenu ${isAdminMenuOpen ? 'show' : ''}`}>
                  <li>
                    <img src={DashIcon} alt="Dash" className="submenu-icon-img" />
                    <Link to="/admin/dashboard" onClick={onClose}>대시보드</Link>
                  </li>
                  <li>
                    <img src={LogIcon} alt="Log" className="submenu-icon-img" />
                    <Link to="/admin/logs" onClick={onClose}>로그 내역</Link>
                  </li>
                  <li>
                    <img src={UserIcon} alt="User" className="submenu-icon-img" />
                    <Link to="/admin/users" onClick={onClose}>사용자 관리</Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {/* 로그인 상태일 때만 테스트용 관리자 모드 토글 표시 */}
          {isLoggedIn && (
            <div className="admin-mode-toggle">
              <span>Admin Mode</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={isAdminMode} 
                  onChange={() => setIsAdminMode(!isAdminMode)} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          )}
          <p>Copyright © 2026 V&T</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;