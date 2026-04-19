import React from 'react';
import '../css/MainSection.css';

const MainSection = () => {
  return (
    <main className="main-section">
      
      <div className="overlay"></div> 
      
      <div className="main-content">
        <div className="text-area">
          <h1>Voice&Text Analyze</h1>
          <p>
            청각 장애인을 위한 서비스<br />
            텍스트 자막만으로 감정을 느껴보세요.
          </p>
          <div className="button-group">
            <button className="btn-primary">카카오 시작하기 →</button>
            <button className="btn-secondary">비회원 이용</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainSection;