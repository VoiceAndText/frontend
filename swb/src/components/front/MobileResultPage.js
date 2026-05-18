import React, { useState } from 'react';
import TextView from './TextView';
import AnalysisView from './AnalysisView';
import '../css/MobileResultPage.css';

const initialMockAudioList = [
  { id: 1, name: 'AUD-02122025.WAV', duration: '00:17:59' },
  { id: 2, name: 'AUD-02122025.WAV', duration: '00:17:59' },
  { id: 3, name: 'AUD-02122025.WAV', duration: '00:17:59', currentTime: '00:00:00', totalTime: '00:04:01' },
  { id: 4, name: 'AUD-02122025.WAV', duration: '00:17:59' },
  { id: 5, name: 'AUD-02122025.WAV', duration: '00:17:59' },
];

const MobileResultPage = () => {
  const [audioList, setAudioList] = useState(initialMockAudioList);
  const [activeAudioId, setActiveAudioId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [viewStep, setViewStep] = useState('list'); 

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

  const handleCardClick = (id) => {
    setActiveAudioId(id);
  };

  if (viewStep === 'list') {
    return (
      <div className="m-page-wrapper">
        <div className="m-list-panel">
          <div className="m-audio-list-scroll">
            {audioList.map((audio) => (
              <div 
                key={audio.id} 
                className={`m-audio-card ${activeAudioId === audio.id ? 'active' : ''}`}
                onClick={() => handleCardClick(audio.id)}
              >
                <div className="m-audio-card-top">
                  <div className="m-play-btn-circle" onClick={(e) => handlePlayToggle(e, audio.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#a09db9">
                      {activeAudioId === audio.id && isPlaying 
                        ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                        : <polygon points="5 3 19 12 5 21 5 3"/>
                      }
                    </svg>
                  </div>
                  <div className="m-audio-info-texts">
                    <span className="m-audio-name-title">{audio.name}</span>
                    <span className="m-audio-duration-time">{audio.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="m-bottom-button-group">
            <button className="m-btn-action-delete" onClick={handleDelete}>삭제하기</button>
            <button className="m-btn-action-analyze" onClick={() => {
              if (!activeAudioId) return alert("오디오를 선택해 주세요.");
              setViewStep('detail');
            }}>분석하기</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-page-wrapper">
      <div className="m-detail-panel">
        <div className="m-top-back-nav">
          <button className="m-btn-back-to-list" onClick={() => setViewStep('list')}>
            ← 오디오 목록으로 가기
          </button>
        </div>

        <div className="m-tab-button-header">
          <button className={`m-tab-item-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>텍스트로 표시</button>
          <button className={`m-tab-item-btn ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>분석 결과</button>
        </div>
        
        <div className="m-tab-view-content">
          {activeTab === 'text' 
            ? <TextView audioId={activeAudioId} /> 
            : <AnalysisView audioId={activeAudioId} />
          }
        </div>
      </div>
    </div>
  );
};

export default MobileResultPage;
