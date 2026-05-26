import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MainSection.css';

const MainSection = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
  const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI;
  const link = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const handlePrimaryAction = () => {
    if (isLoggedIn) {
      navigate('/upload'); 
    } else {
      window.location.href = link;
    }
  };

  const handleGuestAction = () => {
    navigate('/upload');
  };

  return (
    <main className="main-section">
      {/* 배경 오버레이 */}
      <div className="overlay"></div> 
      
      <div className="main-content">
        <div className="text-area">
          <h1>Voice&Text Analyze</h1>
          <p>
            청각 장애인을 위한 서비스<br />
            텍스트 자막만으로 감정을 느껴보세요.
          </p>
          <div className="button-group">
            <button className="btn-primary" onClick={handlePrimaryAction}>
              {isLoggedIn ? '지금 분석하기' : '카카오 시작하기 →'}
            </button>
            {!isLoggedIn && (
              <button className="btn-secondary" onClick={handleGuestAction}>
                비회원 이용
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainSection;