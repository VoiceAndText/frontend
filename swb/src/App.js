import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/front/Header.js';
import MainSection from './components/front/MainSection.js';
import Footer from './components/front/Footer.js';
import KakaoCallback from './components/front/KakaoCallback.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          <Route path="/" element={<MainSection isLoggedIn={isLoggedIn} />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
        <MainSection />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;