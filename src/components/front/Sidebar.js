import React from 'react';
import '../css/Sidebar.css';

// 1. 아이콘 파일들을 임포트합니다. (실제 경로와 파일명으로 수정하세요)
import ProfileIcon from '../images/user.png'; 
import UploadIcon from '../images/upload.png';
import ResultIcon from '../images/research.png';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* 배경 어둡게 처리 (닫기 기능 포함) */}
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      
      {/* 사이드바 본체 */}
      <div className={`sidebar-menu ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            {/* 2. 유저 프로필 이모지(👤) 대신 아이콘 이미지 배치 */}
            <img src={ProfileIcon} alt="Profile" className="profile-icon-img" />
            <span>비회원 MENU</span>
          </div>
        </div>
        
        <nav className="sidebar-content">
          <ul>
            <li>
              {/* 3. 파일 업로드 이모지(🏠) 대신 아이콘 이미지 배치 */}
              <img src={UploadIcon} alt="Upload" className="menu-icon-img" />
              <a href="#upload">파일 업로드</a>
            </li>
            <li>
              {/* 4. 분석 결과 이모지(📄) 대신 아이콘 이미지 배치 */}
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