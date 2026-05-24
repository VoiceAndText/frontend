import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import TextView from './TextView';
import AnalysisView from './AnalysisView';
import MobileResultPage from './MobileResultPage';
import '../css/ResultPage.css';

const ResultPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const uploadedId = searchParams.get('id');
  
  const [analysisResult, setAnalysisResult] = useState(location.state?.analysisResult || null);
  
  const [audioList, setAudioList] = useState([]);
  const [activeAudioId, setActiveAudioId] = useState(uploadedId ? Number(uploadedId) : null);
  const [activeTab, setActiveTab] = useState(uploadedId ? 'analysis' : 'text');
  
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 💡 로그인 여부 확인 변수
  const isLoggedIn = !!sessionStorage.getItem('accessToken');

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
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

  useEffect(() => {
    if (uploadedId && location.state?.audioUrl) {
      setAudioList(prevList => {
        const isExist = prevList.find(audio => audio.id === Number(uploadedId));
        if (!isExist) {
          return [{
            id: Number(uploadedId),
            name: location.state?.fileName || '업로드한 음성 파일',
            duration: location.state?.fileDuration 
            ? formatTime(location.state.fileDuration) 
            : '00:00',
            audioUrl: location.state.audioUrl 
          }, ...prevList];
        }
        return prevList;
      });
    }
  }, [uploadedId, location.state]);

  useEffect(() => {
    const fetchMyAudioList = async () => {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return; 

      try {
        const res = await fetch('https://voiceandtext.duckdns.org/api/v1/files?page=0&size=20', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const resData = await res.json();
          const fetchedFiles = resData.data.content.map(file => ({
            id: file.analysisRequestId,
            name: file.originalFileName,
            duration: formatTime(file.durationSeconds),
            audioUrl: null
          }));

          setAudioList(prevList => {
            const prevIds = prevList.map(a => a.id);
            const newFiles = fetchedFiles.filter(f => !prevIds.includes(f.id));
            return [...prevList, ...newFiles];
          });
        }
      } catch (error) {
        console.error("파일 목록 불러오기 에러:", error);
      }
    };

    fetchMyAudioList();
  }, []);

  const handleCardClick = async (id) => {
    if (activeAudioId === id) return;

    setActiveAudioId(id);
    setIsPlaying(false);
    setCurrentTime(0);
    setAnalysisResult(null);

    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    try {
      const urlRes = await fetch(`https://voiceandtext.duckdns.org/api/v1/files/${id}/presigned-url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        setAudioList(prev => prev.map(audio => 
          audio.id === id ? { ...audio, audioUrl: urlData.data.presignedUrl } : audio
        ));
      }

      const analysisRes = await fetch(`https://voiceandtext.duckdns.org/api/v1/analysis/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        setAnalysisResult(analysisData.data.result);
      }
    } catch (error) {
      console.error("상세 정보 불러오기 에러:", error);
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

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioRef.current.src) {
        audioRef.current.play().catch(e => console.log("재생 대기:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeAudioId, audioList]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <MobileResultPage 
        uploadedId={uploadedId} 
        audioList={audioList} 
        setAudioList={setAudioList} 
        analysisResult={analysisResult} 
      />
    );
  }

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
      
      if (typeof setAnalysisResult === 'function') {
        setAnalysisResult(null); 
      }
      
      alert("성공적으로 삭제되었습니다.");

    } catch (error) {
      console.error("파일 삭제 에러:", error);
      alert("파일 삭제 중 오류가 발생했습니다.");
    }
  };

  const activeAudio = audioList.find(a => a.id === activeAudioId);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="result-page-wrapper">
      <div className="result-page-container">
        
        {activeAudio && activeAudio.audioUrl && (
          <audio
            ref={audioRef}
            src={activeAudio.audioUrl}
            onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => setDuration(audioRef.current.duration)}
            onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
          />
        )}

        <div className="result-left-panel">
          <div className="audio-list-container">
            {/* ✨ 여기가 수정된 핵심 부분입니다 */}
            {audioList.length > 0 ? (
              audioList.map((audio) => (
                <div 
                  key={audio.id} 
                  className={`audio-card ${activeAudioId === audio.id ? 'active' : ''}`}
                  onClick={() => handleCardClick(audio.id)}
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
              /* ✨ 파일이 없을 때 보여줄 안내 문구 */
              <div className="empty-list-notice">
                <p>음성 파일을 업로드해주세요.</p>
              </div>
            )}
          </div>
          
          {/* PC 회원: 분석하기 버튼 삭제, 삭제하기 버튼만 표시 / 비회원: 아예 안 보임 */}
          {isLoggedIn && (
            <div className="left-action-buttons">
              <button className="btn-delete" onClick={handleDelete}>삭제하기</button>
            </div>
          )}
        </div>

        <div className="result-right-panel">
          <div className="tab-header">
            <button className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>텍스트로 보기</button>
            <button className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>분석 결과</button>
          </div>
          
          <div className="tab-content-area">
            {activeAudioId ? (
              activeTab === 'text' 
                ? <TextView audioId={activeAudioId} analysisResult={analysisResult} /> 
                : <AnalysisView audioId={activeAudioId} analysisResult={analysisResult} />
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