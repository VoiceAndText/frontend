import React, { useState } from 'react';
import '../css/ResultPage.css';

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

  const handleDelete = () => {
    if (!activeAudioId) {
      alert("삭제할 음성 파일을 먼저 선택해 주세요.");
      return;
    }
    
    if (window.confirm("선택한 음성 파일을 삭제하시겠습니까?")) {
      setAudioList(prevList => prevList.filter(audio => audio.id !== activeAudioId));
      setActiveAudioId(null); 
      setIsPlaying(false);
    }
  };

  const handlePlayToggle = (e, audioId) => {
    e.stopPropagation();
    
    if (activeAudioId === audioId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveAudioId(audioId);
      setIsPlaying(true);
    }
  };

  return (
    <div className="result-page-wrapper">
      <div className="result-page-container">
        
        <div className="result-left-panel">
          <div className="audio-list-container">
            {audioList.map((audio) => (
              <div 
                key={audio.id} 
                className={`audio-card ${activeAudioId === audio.id ? 'active' : ''}`}
                onClick={() => {
                  if (activeAudioId !== audio.id) {
                    setActiveAudioId(audio.id);
                    setIsPlaying(true);
                  }
                }}
              >
                <div className="audio-card-top">
                  <div 
                    className="play-icon-circle"
                    onClick={(e) => handlePlayToggle(e, audio.id)}
                  >
                    {activeAudioId === audio.id && isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#a09db9"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#a09db9"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    )}
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
            {audioList.length === 0 && (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '50px' }}>
                업로드된 음성 파일이 없습니다.
              </p>
            )}
          </div>
          <div className="left-action-buttons">
            <button className="btn-delete" onClick={handleDelete}>삭제하기</button>
            <button className="btn-analyze">분석하기</button>
          </div>
        </div>

        <div className="result-right-panel">
          {/* 우측 분석 결과 */}
        </div>

      </div>
    </div>
  );
};

export default ResultPage;