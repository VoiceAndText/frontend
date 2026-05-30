import React, { useState, useEffect, useRef } from 'react';
import TextView from './TextView';
import AnalysisView from './AnalysisView';
import '../css/MobileResultPage.css';

const MobileResultPage = ({ uploadedId, audioList, setAudioList, analysisResult, setAnalysisResult }) => {
  const [activeAudioId, setActiveAudioId] = useState(uploadedId ? Number(uploadedId) : null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(uploadedId ? 'analysis' : 'text');
  const [viewStep, setViewStep] = useState(uploadedId ? 'detail' : 'list');

  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isLoggedIn = !!sessionStorage.getItem('accessToken');

  const formatTime = (time) => {
    if (!time || isNaN(time) || time === Infinity) return '00:00';
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const activeAudio = audioList.find(a => a.id === activeAudioId);
  const audioUrl = activeAudio ? activeAudio.audioUrl : null;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioUrl) {
        audioRef.current.play().catch(e => console.log("재생 대기:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioUrl]);

  const handleDelete = async () => {
    if (!activeAudioId) return alert("삭제할 파일을 선택해 주세요.");
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const token = sessionStorage.getItem('accessToken');

    try {
      if (token) {
        const res = await fetch(`https://voiceandtext.duckdns.org/api/v1/files/${activeAudioId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("서버에서 파일 삭제를 실패했습니다.");
        }
      }

      setAudioList(prev => prev.filter(a => a.id !== activeAudioId));
      setActiveAudioId(null);
      setIsPlaying(false);
      setViewStep('list'); 
      if (setAnalysisResult) setAnalysisResult(null); 
      
      alert("성공적으로 삭제되었습니다.");

    } catch (error) {
      console.error("파일 삭제 에러:", error);
      alert("파일 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCardClick = async (id) => {
    if (activeAudioId === id) return;
    
    setActiveAudioId(id);
    setIsPlaying(false);
    setCurrentTime(0);

    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    try {
      const urlRes = await fetch(`https://voiceandtext.duckdns.org/api/v1/files/${id}/presigned-url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        setAudioList(prev => prev.map(a => a.id === id ? { ...a, audioUrl: urlData.data.presignedUrl } : a));
      }
    } catch (error) {
      console.error("URL 불러오기 에러:", error);
    }
  };

  const handlePlayToggle = async (e, id) => {
    e.stopPropagation();
    if (activeAudioId === id) {
      setIsPlaying(!isPlaying);
    } else {
      await handleCardClick(id);
      setIsPlaying(true);
    }
  };

  const handleViewResult = async () => {
    if (!activeAudioId) return alert("음성파일을 선택해 주세요.");

    const token = sessionStorage.getItem('accessToken');
    if (token) {
      try {
        const urlRes = await fetch(`https://voiceandtext.duckdns.org/api/v1/files/${activeAudioId}/presigned-url`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (urlRes.ok) {
          const urlData = await urlRes.json();
          setAudioList(prev => prev.map(a => a.id === activeAudioId ? { ...a, audioUrl: urlData.data.presignedUrl } : a));
        }

        const analysisRes = await fetch(`https://voiceandtext.duckdns.org/api/v1/analysis/${activeAudioId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (analysisRes.ok) {
          const analysisData = await analysisRes.json();
          if (setAnalysisResult) setAnalysisResult(analysisData.data.result);
        }
      } catch (error) {
        console.error("데이터 불러오기 에러:", error);
      }
    }
    
    setViewStep('detail');
  };

  if (viewStep === 'list') {
    return (
      <div className="m-page-wrapper">
        
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => {
              if (audioRef.current.duration === Infinity) {
                audioRef.current.currentTime = 1e101; 
                audioRef.current.ontimeupdate = () => {
                  audioRef.current.ontimeupdate = null;
                  audioRef.current.currentTime = 0;
                  setDuration(audioRef.current.duration);
                };
              } else {
                setDuration(audioRef.current.duration);
              }
            }}
            onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
          />
        )}

        <div className="m-list-panel">
          <div className="m-audio-list-scroll">
            {audioList.length > 0 ? (
              audioList.map((audio) => (
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
                  
                  {activeAudioId === audio.id && (
                    <div className="audio-progress-section" style={{ marginTop: '10px' }}>
                      <div className="progress-bar-bg" onClick={handleProgressClick} style={{ cursor: 'pointer' }}>
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                        <div className="progress-bar-thumb" style={{ left: `${progressPercent}%` }}></div>
                      </div>
                      <div className="progress-time">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}

                </div>
              ))
            ) : (
              <div className="m-empty-list-notice">
                <p>음성 파일을 업로드해주세요.</p>
              </div>
            )}
          </div>
          
          {isLoggedIn && (
            <div className="m-bottom-button-group">
              <button className="m-btn-action-delete" onClick={handleDelete}>삭제하기</button>
              <button className="m-btn-action-analyze" onClick={handleViewResult}>결과보기</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="m-page-wrapper">
      <div className="m-detail-panel">
        
        {isLoggedIn && (
          <div className="m-top-back-nav">
            <button className="m-btn-back-to-list" onClick={() => setViewStep('list')}>
              ← 음성 목록으로 가기
            </button>
          </div>
        )}

        <div className="m-tab-button-header">
          <button className={`m-tab-item-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>텍스트로 보기</button>
          <button className={`m-tab-item-btn ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>분석 결과</button>
        </div>
        
        <div className="m-tab-view-content">
          {activeTab === 'text' 
            ? <TextView audioId={activeAudioId} analysisResult={analysisResult} /> 
            : <AnalysisView audioId={activeAudioId} analysisResult={analysisResult} />
          }
        </div>
      </div>
    </div>
  );
};

export default MobileResultPage;