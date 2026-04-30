import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/MobileSidebar.css';


import ProfileIcon from '../images/user.png'; 
import UploadIcon from '../images/upload.png';
import ResultIcon from '../images/research.png';
import AdminIcon from '../images/admin_main.png'; 
import DashIcon from '../images/admin_dash.png';
import LogIcon from '../images/admin_log.png';
import UserIcon from '../images/admin_user.png';
import KakaoIcon from '../images/kakao_login.png';

const Sidebar = ({ isOpen, onClose, isLoggedIn, onLogout, onLogin }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (!isOpen) {
      setIsAdminMenuOpen(false);
    }
  }, [isOpen]);

  // 로그아웃 핸들러
  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    onClose();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div className={`mobile-sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      
      <div className={`mobile-sidebar-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <div className="user-profile">
            <img src={ProfileIcon} alt="Profile" className="profile-icon-img" />
            <span>{isLoggedIn ? '회원 MENU' : '비회원 MENU'}</span>
          </div>
        </div>
        
        <nav className="mobile-sidebar-content">
          <ul>
            {!isLoggedIn ? (
              <li className="login-menu-item">
                <button className="kakao-login-btn" onClick={onLogin}>
                  <img src={KakaoIcon} alt="카카오 로그인" className="kakao-login-img" />
                </button>
              </li>
            ) : (
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
              <Link to="/results" onClick={onClose}>분석 결과 확인</Link>
            </li>

            {isLoggedIn && isAdminMode && (
              <li className={`admin-menu-li ${isAdminMenuOpen ? 'active' : ''}`}>
                <div className="menu-item-wrapper" onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}>
                  <div className="menu-item-main">
                    <img src={AdminIcon} alt="Admin" className="menu-icon-img" />
                    <span>관리자 설정</span>
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
                    <Link to="/admin/adminlogs" onClick={onClose}>로그 내역</Link>
                  </li>
                  <li>
                    <img src={UserIcon} alt="User" className="submenu-icon-img" />
                    <Link to="/admin/adminusers" onClick={onClose}>사용자 관리</Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>

        <div className="mobile-sidebar-footer">
          {isLoggedIn && (
            <>
              <div className="admin-mode-toggle">
                <span>관리자 모드</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isAdminMode} 
                    onChange={() => setIsAdminMode(!isAdminMode)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <button className="logout-btn" onClick={handleLogoutClick}>
                로그아웃
              </button>
            </>
          )}
          <p className="copyright">Copyright © 2026 V&T</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;