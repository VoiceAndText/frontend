import React, { useState } from 'react';
import '../css/Header.css';
import Sidebar from './Sidebar'; 
import Logo from '../images/Logo.png';

// 1. 아이콘 파일들을 임포트합니다. (실제 경로와 파일명으로 수정하세요)
import HomeIcon from '../images/home.png'; 
import LoginIcon from '../images/profile.png';

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            {/* 클릭 시 사이드바 열림 */}
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
            {/* 2. Home 텍스트 대신 아이콘 이미지 배치 */}
            <a href="#home" className="nav-item">
              <img src={HomeIcon} alt="Home" className="nav-icon" />
              <span>Home</span>
            </a>

            {/* 3. Login 버튼 내부의 이모지 대신 아이콘 이미지 배치 */}
            <button className="login-btn">
              <img src={LoginIcon} alt="Login" className="lock-icon-img" />
              Login
            </button>
          </nav>
        </div>
      </header>

      {/* 사이드바 컴포넌트 호출 */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </>
  );
};

export default Header;