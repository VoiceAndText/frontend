import React, { useState, useRef, useMemo } from 'react';
import '../css/UploadPage.css';
import Record from './Record.js'; 

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const processFile = async (file) => {
    if (!file) return;
    const audio = document.createElement('audio');
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.onloadedmetadata = () => {
      if (audio.duration > 61) {
        alert("1분 이내의 음성 파일만 업로드 가능합니다.");
      } else {
        setSelectedFile(file);
        setAudioDuration(audio.duration);
      }
      window.URL.revokeObjectURL(url);
    };
  };

  const handleRecordComplete = (audioFile, duration) => {
    setSelectedFile(audioFile);
    setAudioDuration(duration);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAudioDuration(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="upload-page-wrapper">
      <div className="upload-page-container">
        <div className="upload-left-block">
          <div 
            className={`dropzone-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
          >
            <div className="dropzone-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M12 15v-6"></path><path d="M9 12l3-3 3 3"></path></svg>
            </div>
            <h2 className="dropzone-title">파일을 선택하거나 여기에 드래그 앤 드롭하세요.</h2>
            <p className="dropzone-subtitle">음성 파일만 가능하며, 최대 1분입니다.</p>
            <button className="browse-btn" onClick={() => fileInputRef.current.click()}>파일 찾아보기</button>
            <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} accept="audio/*" />
          </div>

          <div className="uploaded-files-section">
            <h3 className="section-title">업로드된 파일</h3>
            {selectedFile ? (
              <div key={selectedFile.name} className="file-container" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div className="file-info-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedFile.name}</span>
                      <br />
                      <span style={{ fontSize: '12px', color: '#999' }}>{formatSize(selectedFile.size)} • {formatTime(audioDuration)}</span>
                    </div>
                  </div>
                  <button onClick={handleRemoveFile} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
                <audio key={previewUrl} controls src={previewUrl} style={{ width: '100%', height: '40px' }} />
              </div>
            ) : (
              <p style={{ color: '#999', fontSize: '14px' }}>1분 이내의 파일을 선택해 주세요.</p>
            )}
          </div>

          <div className="bottom-action-buttons">
            <button className="btn-cancel" onClick={handleRemoveFile}>취소</button>
            <button className="btn-attach" onClick={() => alert("파일이 첨부되었습니다.")}>파일 첨부</button>
          </div>
        </div>

        <Record onRecordComplete={handleRecordComplete} />
      </div>
    </div>
  );
};

export default UploadPage;