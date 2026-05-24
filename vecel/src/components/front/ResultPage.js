import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import TextView from './TextView';
import AnalysisView from './AnalysisView';
import MobileResultPage from './MobileResultPage'; // 💡 모바일용 컴포넌트 임포트
import '../css/ResultPage.css'; // PC용 오리지널 CSS

const ResultPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const uploadedId = searchParams.get('id'); // 주소창의 ?id=번호 읽기
  const analysisResult = location.state?.analysisResult || null; // UploadPage에서 보낸 진짜 데이터
  const [audioList, setAudioList] = useState([]);
  const [activeAudioId, setActiveAudioId] = useState(uploadedId ? Number(uploadedId) : null);
  const [activeTab, setActiveTab] = useState(uploadedId ? 'analysis' : 'text');
  const [isPlaying, setIsPlaying] = useState(true);

  // 1. 모바일 화면 감지 로직
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // 결과 페이지에 진입하면 무조건 뜨는 기본 확인 로그
    console.log("🚀 [ResultPage] 업데이트 ver.2 적용 완료! 결과 화면에 정상 진입했습니다.");

    // 만약 업로드 페이지에서 분석이 완료되어 넘어온 경우라면 데이터 분실 여부까지 검사
    if (uploadedId) {
      console.log("🔥 [디버깅] 업로드 후 자동 이동 확인됨!");
      console.log("🆔 주소창에서 읽어온 분석 ID (uploadedId):", uploadedId);
      console.log("📦 보따리에서 꺼낸 진짜 분석 결과 (analysisResult):", analysisResult);
      console.log("🎵 함께 넘어온 음성 파일 URL (audioUrl):", location.state?.audioUrl);
    }
  }, [uploadedId, analysisResult, location.state]);

  useEffect(() => {
    // 주소창에 방금 업로드한 id가 있고, 보따리에 음성 파일 URL이 들어있다면?
    if (uploadedId && location.state?.audioUrl) {
      setAudioList(prevList => {
        // 이미 리스트에 이 파일이 있는지 검사 (중복 추가 방지)
        const isExist = prevList.find(audio => audio.id === Number(uploadedId));
        
        if (!isExist) {
          // 리스트에 없으면 새로운 가상의 오디오 객체를 만들어서 맨 앞에 끼워 넣음!
          const newAudio = {
            id: Number(uploadedId),
            name: '방금 분석한 음성 파일', // 나중에 UploadPage에서 진짜 이름을 넘겨받아도 됩니다.
            duration: '방금 전',
            audioUrl: location.state.audioUrl // 이 주소로 나중에 재생 기능을 연결합니다.
          };
          return [newAudio, ...prevList];
        }
        return prevList;
      });
    }
  }, [uploadedId, location.state]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
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