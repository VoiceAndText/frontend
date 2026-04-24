import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/front/Header.js';
import MainSection from './components/front/MainSection.js';
import Footer from './components/front/Footer.js';
import KakaoCallback from './components/front/KakaoCallback.js';
import MyPage from './components/front/MyPage.js';
import UploadPage from './components/front/UploadPage.js';
import Dashboard from './components/front/Dashboard.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const savedLoginStatus = sessionStorage.getItem('isLoggedIn');
    const savedUserInfo = sessionStorage.getItem('userInfo');

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
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;