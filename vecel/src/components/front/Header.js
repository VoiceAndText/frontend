// Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header.css';
import Sidebar from './Sidebar'; 
import MobileSidebar from './MobileSidebar'; 
import Logo from '../images/Logo.png';
import HomeIcon from '../images/home.png'; 
import LoginIcon from '../images/profile.png';
import AdminIcon from '../images/admin_icon.png';
import KakaoLoginBtnImg from '../images/kakao_login.png';
import { fetchWithAuth } from './api';

const Header = ({ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();
  const loginWrapperRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;

    try {
      await fetchWithAuth('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('로그아웃 API 통신 에러:', error);
    } finally {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('isAdmin');
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      setIsLoggedIn(false);
      if (setIsAdmin) setIsAdmin(false);
      
      alert("로그아웃 되었습니다.");
      navigate('/');
    }
  };

  const handleKakaoLogin = () => {
    const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
    const link = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = link;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginWrapperRef.current && !loginWrapperRef.current.contains(event.target)) {
        setIsLoginPopupOpen(false);
      }
    };
    if (isLoginPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLoginPopupOpen]);

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
              <Link to="/">
                <img src={Logo} alt="V&T Logo" className="logo-image" />
              </Link>
            </div>
          </div>

          <nav className="header-nav">
            {!isMobile && (
              <Link to="/" className="nav-item">
                <img src={HomeIcon} alt="Home" className="nav-icon" />
                <span>Home</span>
              </Link>
            )}

            {!isMobile && isLoggedIn && isAdmin && (
              <Link to="/admin" className="nav-item admin-nav-item">
                <img src={AdminIcon || LoginIcon} alt="Admin" className="nav-icon" />
                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Admin</span>
              </Link>
            )}

            {!isMobile && (
              <div className="login-wrapper" ref={loginWrapperRef}>
                {isLoggedIn ? (
                  <button className="login-btn" onClick={handleLogout}>
                    <img src={LoginIcon} alt="Logout" className="lock-icon-img" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <>
                    <button className="login-btn" onClick={() => setIsLoginPopupOpen(!isLoginPopupOpen)}>
                      <img src={LoginIcon} alt="Login" className="lock-icon-img" />
                      <span>Login</span>
                    </button>

                    {isLoginPopupOpen && (
                      <div className="login-popup">
                        <button className="kakao-login-btn" onClick={handleKakaoLogin}>
                          <img src={KakaoLoginBtnImg} alt="Kakao Login" className="kakao-btn-img" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {isMobile ? (
        <MobileSidebar 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar} 
          isLoggedIn={isLoggedIn} 
          isAdmin={isAdmin}
          onLogout={handleLogout} 
          onLogin={handleKakaoLogin}
        />
      ) : (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar} 
          isLoggedIn={isLoggedIn} 
          isAdmin={isAdmin}
        />
      )}
    </>
  );
};

export default Header;
