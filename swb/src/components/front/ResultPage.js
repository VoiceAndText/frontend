import React, { useState, useEffect } from 'react';
import TextView from './TextView';
import AnalysisView from './AnalysisView';
import MobileResultPage from './MobileResultPage'; // 💡 모바일용 컴포넌트 임포트
import '../css/ResultPage.css'; // PC용 오리지널 CSS

const initialMockAudioList = [
  { id: 1, name: 'AUD-02122025.WAV', duration: '00:17:59' },
  { id: 2, name: 'AUD-02122025.WAV', duration: '00:17:59' },
  { id: 3, name: 'AUD-02122025.WAV', duration: '00:17:59', currentTime: '00:00:00', totalTime: '00:04:01' },
  { id: 4, name: 'AUD-02122025.WAV', duration: '00:17:59' },
  { id: 5, name: 'AUD-02122025.WAV', duration: '00:17:59' },
];

const ResultPage = () => {
  const [audioList, setAudioList] = useState(initialMockAudioList);
  const [activeAudioId, setActiveAudioId] = useState(3);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('text');

  // 1. 모바일 화면 감지 로직
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  if (isMobile) {
    return <MobileResultPage />;
  }


  const handleDelete = () => {
    if (!activeAudioId) return alert("삭제할 파일을 선택해 주세요.");
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setAudioList(prev => prev.filter(a => a.id !== activeAudioId));
      setActiveAudioId(null);
      setIsPlaying(false);
    }
  };

  const handlePlayToggle = (e, id) => {
    e.stopPropagation();
    if (activeAudioId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveAudioId(id);
      setIsPlaying(true);
    }
  };

  return (
    <div className="result-page-wrapper">
      <div className="result-page-container">
        
        {/* 좌측 패널: 오디오 리스트 */}
        <div className="result-left-panel">
          <div className="audio-list-container">
            {audioList.map((audio) => (
              <div 
                key={audio.id} 
                className={`audio-card ${activeAudioId === audio.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveAudioId(audio.id);
                  setIsPlaying(true);
                }}
              >
                <div className="audio-card-top">
                  <div className="play-icon-circle" onClick={(e) => handlePlayToggle(e, audio.id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#a09db9">
                      {activeAudioId === audio.id && isPlaying 
                        ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                        : <polygon points="5 3 19 12 5 21 5 3"/>
                      }
                    </svg>
                  </div>
                  <div className="audio-info">
                    <span className="audio-name">{audio.name}</span>
                    <span className="audio-duration">{audio.duration}</span>
                  </div>
                </div>
                {activeAudioId === audio.id && (
                  <div className="audio-progress-section">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: '15%' }}></div>
                      <div className="progress-bar-thumb" style={{ left: '15%' }}></div>
                    </div>
                    <div className="progress-time">
                      <span>{audio.currentTime || '00:00:00'}</span>
                      <span>{audio.totalTime || '00:04:01'}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="left-action-buttons">
            <button className="btn-delete" onClick={handleDelete}>삭제하기</button>
            <button className="btn-analyze">분석하기</button>
          </div>
        </div>

        {/* 우측 패널 */}
        <div className="result-right-panel">
          <div className="tab-header">
            <button className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>텍스트로 보기</button>
            <button className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>분석 결과</button>
          </div>
          
          <div className="tab-content-area">
            {activeAudioId ? (
              activeTab === 'text' 
                ? <TextView audioId={activeAudioId} /> 
                : <AnalysisView audioId={activeAudioId} />
            ) : (
              <div className="empty-selection">파일을 선택하면 분석 결과가 나타납니다.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;