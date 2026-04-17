import React, { useState, useRef } from 'react';
import '../css/UploadPage.css';

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const checkAudioDuration = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('audio')) {
        reject("음성 파일(오디오)만 업로드할 수 있습니다."); 
        return;
      }

      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = URL.createObjectURL(file);

      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration); 
      };

      audio.onerror = () => {
        reject("음성 파일을 읽는 중 오류가 발생했습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.");
      };
    });
  };

  const processFile = async (file) => {
    try {
      const duration = await checkAudioDuration(file);
      if (duration > 60) {
        alert("1분 이내의 음성 파일만 업로드 가능합니다. (현재 파일: " + Math.floor(duration) + "초)");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setSelectedFile(file);
      setAudioDuration(duration);
      
    } catch (error) {
      alert(error); 
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    
    if (files.length > 1) {
      alert("한 번에 1개의 음성 파일만 업로드할 수 있습니다.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (files.length === 1) {
      processFile(files[0]);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    
    if (files.length > 1) {
      alert("한 번에 1개의 음성 파일만 업로드할 수 있습니다.");
      return;
    }

    if (files.length === 1) {
      processFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAudioDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleAttach = () => {
    if (!selectedFile) {
      alert("업로드할 파일을 먼저 선택해 주세요.");
      return;
    }

    alert("음성 파일을 성공적으로 업로드했습니다.");

    handleRemoveFile(); 
  };

  return (
    <div className="upload-page-wrapper">
      <div className="upload-page-container">
        <div className="upload-left-block">
          <div 
            className={`dropzone-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                <path d="M12 15v-6"></path>
                <path d="M9 12l3-3 3 3"></path>
              </svg>
            </div>
            <h2 className="dropzone-title">Choose a file or drag & drop it here</h2>
            <p className="dropzone-subtitle">MP3, WAV, M4A, FLAC (Max 1 minute)</p>
            
            <button className="browse-btn" onClick={handleBrowseClick}>Browse File</button>
            <input 
              type="file" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="audio/*" 
            />
          </div>

          <div className="uploaded-files-section">
            <h3 className="section-title">Uploaded Files</h3>
            {selectedFile ? (
              <div className="file-item">
                <div className="file-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                </div>
                <div className="file-info">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-status">
                    {formatSize(selectedFile.size)} • {formatTime(audioDuration)}
                  </span>
                </div>
                <button className="delete-btn" onClick={handleRemoveFile}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ) : (
              <p style={{ color: '#999', fontSize: '14px' }}>1분 이내의 음성 파일을 선택해 주세요.</p>
            )}
          </div>

          <div className="bottom-action-buttons">
            <button className="btn-cancel" onClick={handleRemoveFile}>Cancel</button>
            <button className="btn-attach" onClick={handleAttach}>Attach File</button>
          </div>
        </div>

        <div className="upload-right-block">
          <div className="placeholder-text">
            <p>1번에 분석 가능한 녹음은 최대 1분입니다.</p>
            {/* 이 구역에 개발하시면 될 것 같습니다 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;