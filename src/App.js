import React from 'react';
import './App.css';
import Header from './components/front/Header.js';
import MainSection from './components/front/MainSection.js';
import Footer from './components/front/Footer.js';

function App() {
  return (
    <div className="App">
      <Header />
      <MainSection />
      <Footer />
    </div>
  );
}

export default App;