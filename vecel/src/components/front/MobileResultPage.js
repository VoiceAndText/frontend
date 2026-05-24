import React, { useState } from 'react';
import TextView from './TextView';
import AnalysisView from './AnalysisView';
import '../css/MobileResultPage.css';

const MobileResultPage = ({ uploadedId, audioList, setAudioList, analysisResult }) => {
  const [activeAudioId, setActiveAudioId] = useState(uploadedId ? Number(uploadedId) : null);
  const [activeTab, setActiveTab] = useState(uploadedId ? 'analysis' : 'text');
  const [viewStep, setViewStep] = useState(uploadedId ? 'detail' : 'list');

  // 💡 로그인 여부 확인 변수
  const isLoggedIn = !!sessionStorage.getItem('accessToken');

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
      
      alert("성공적으로 삭제되었습니다.");

    } catch (error) {
      console.error("파일 삭제 에러:", error);
      alert("파일 삭제 중 오류가 발생했습니다.");
    }
  };

  if (viewStep === 'list') {
    return (
      <div className="m-page-wrapper">
        <div className="m-list-panel">
          <div className="m-audio-list-scroll">
            {audioList.length > 0 ? (
              audioList.map((audio) => (
                <div key={audio.id} className="m-audio-card" onClick={() => setActiveAudioId(audio.id)}>
                   <div className="m-audio-info-texts">
                    <span className="m-audio-name-title">{audio.name}</span>
                    <span className="m-audio-duration-time">{audio.duration}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="m-empty-list-notice"><p>음성 파일을 업로드해주세요.</p></div>
            )}
          </div>
          {isLoggedIn && audioList.length > 0 && (
            <div className="m-bottom-button-group">
              <button className="m-btn-action-delete" onClick={handleDelete}>삭제하기</button>
              <button className="m-btn-action-analyze" onClick={() => { if(activeAudioId) setViewStep('detail'); }}>결과보기</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="m-page-wrapper">
      <div className="m-detail-panel">
        
        {/* ✨ 비회원(단일 파일)일 경우 오디오 목록으로 가는 뒤로가기 버튼 감추기 */}
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