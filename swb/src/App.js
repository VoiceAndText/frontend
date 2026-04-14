import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/front/Header.js';
import MainSection from './components/front/MainSection.js';
import Footer from './components/front/Footer.js';
import KakaoCallback from './components/front/KakaoCallback.js';
import MyPage from './components/front/MyPage.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 앱이 처음 로드될 때 로컬 스토리지 확인
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    const savedUserInfo = localStorage.getItem('userInfo');

    if (savedLoginStatus === 'true' && savedUserInfo) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          <Route path="/" element={<MainSection isLoggedIn={isLoggedIn} />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback setIsLoggedIn={setIsLoggedIn} setUserInfo={setUserInfo} />} />
          <Route path="/profile" element={<MyPage userInfo={userInfo} setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;