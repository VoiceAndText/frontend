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
  
  // 💡 1. analysisResult를 상수가 아닌 상태(State)로 변경합니다. (다른 파일 클릭 시 갱신을 위해)
  const [analysisResult, setAnalysisResult] = useState(location.state?.analysisResult || null);
  
  const [audioList, setAudioList] = useState([]);
  const [activeAudioId, setActiveAudioId] = useState(uploadedId ? Number(uploadedId) : null);
  const [activeTab, setActiveTab] = useState(uploadedId ? 'analysis' : 'text');
  
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  // 방금 업로드한 파일 처리
  useEffect(() => {
    if (uploadedId && location.state?.audioUrl) {
      setAudioList(prevList => {
        const isExist = prevList.find(audio => audio.id === Number(uploadedId));
        if (!isExist) {
          return [{
            id: Number(uploadedId),
            name: '방금 분석한 음성 파일',
            duration: '방금 전',
            audioUrl: location.state.audioUrl 
          }, ...prevList];
        }
        return prevList;
      });
    }
  }, [uploadedId, location.state]);

  // 회원일 경우 서버에서 내 파일 목록 불러오기
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
            audioUrl: null // 초기엔 재생 링크가 없음
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

  // ✨ 2. 리스트를 클릭했을 때 해당 파일의 '재생 링크'와 '분석 결과'를 가져오는 핵심 함수!
  const handleCardClick = async (id) => {
    if (activeAudioId === id) return; // 이미 선택된 파일이면 무시

    setActiveAudioId(id);
    setIsPlaying(false);
    setCurrentTime(0);
    setAnalysisResult(null); // 로딩 중 빈 화면을 위해 초기화

    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    try {
      // [API 1] 재생 링크(presigned-url) 발급받기
      const urlRes = await fetch(`https://voiceandtext.duckdns.org/api/v1/files/${id}/presigned-url`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        // audioList 업데이트 (해당 파일에 발급받은 URL 쏙 집어넣기)
        setAudioList(prev => prev.map(audio => 
          audio.id === id ? { ...audio, audioUrl: urlData.data.presignedUrl } : audio
        ));
      }

      // [API 2] 분석 결과 알맹이 가져오기
      const analysisRes = await fetch(`https://voiceandtext.duckdns.org/api/v1/analysis/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        setAnalysisResult(analysisData.data.result); // 우측 뷰에 데이터 뿌려주기!
      }
    } catch (error) {
      console.error("상세 정보 불러오기 에러:", error);
    }
  };

  // ✨ 3. 재생 버튼 클릭 시 로직 연동
  const handlePlayToggle = async (e, id) => {
    e.stopPropagation();
    if (activeAudioId === id) {
      setIsPlaying(!isPlaying);
    } else {
      await handleCardClick(id); // 데이터 먼저 가져오고
      setIsPlaying(true);        // 재생 시작
    }
  };

  // 오디오 재생 동기화
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioRef.current.src) {
        audioRef.current.play().catch(e => console.log("재생 대기:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeAudioId, audioList]); // audioList가 갱신되어 src가 생겼을 때도 감지

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

  const handleDelete = () => {
    if (!activeAudioId) return alert("삭제할 파일을 선택해 주세요.");
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setAudioList(prev => prev.filter(a => a.id !== activeAudioId));
      setActiveAudioId(null);
      setIsPlaying(false);
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
            {audioList.map((audio) => (
              <div 
                key={audio.id} 
                className={`audio-card ${activeAudioId === audio.id ? 'active' : ''}`}
                onClick={() => handleCardClick(audio.id)} // 💡 클릭 시 데이터 가져오는 함수 연결
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
            ))}
          </div>
          <div className="left-action-buttons">
            <button className="btn-delete" onClick={handleDelete}>삭제하기</button>
            <button className="btn-analyze">분석하기</button>
          </div>
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