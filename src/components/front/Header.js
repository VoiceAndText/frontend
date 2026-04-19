import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Header.css';
import Sidebar from './Sidebar'; 
import Logo from '../images/Logo.png';
import HomeIcon from '../images/home.png'; 
import LoginIcon from '../images/profile.png';
import KakaoLoginBtnImg from '../images/kakao_login.png';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
  };

  const handleKakaoLogin = () => {
    const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
    const link = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = link;
  };

  const loginWrapperRef = useRef(null);

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
            
            <Link to="/" className="nav-item">
              <img src={HomeIcon} alt="Home" className="nav-icon" />
              <span>Home</span>
            </Link>

            <div className="login-wrapper" ref={loginWrapperRef}>
              {isLoggedIn ? (
                <button className="login-btn" onClick={handleLogout}>
                  <img src={LoginIcon} alt="Logout" className="lock-icon-img" />
                  Logout
                </button>
              ) : (
                <>
                  <button className="login-btn" onClick={() => setIsLoginPopupOpen(!isLoginPopupOpen)}>
                    <img src={LoginIcon} alt="Login" className="lock-icon-img" />
                    Login
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
          </nav>
        </div>
      </header>

      
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} isLoggedIn={isLoggedIn} />
    </>
  );
};

export default Header;