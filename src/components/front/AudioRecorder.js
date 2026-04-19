import React, { useState, useRef } from 'react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 녹음 시작 함수
  const startRecording = async () => {
    try {
      // 마이크 권한 요청 및 스트림 획득
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      // 데이터가 가용할 때마다 배열에 저장
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 녹음 중지 시 Blob 생성 및 URL 설정
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url); // 미리보기 및 다운로드용 URL
        
        // 스트림 트랙 종료 (마이크 아이콘 제거)
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("마이크 접근 권한이 거부되었거나 오류가 발생했습니다:", err);
    }
  };

  // 녹음 중지 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 파일 저장(다운로드) 함수
  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `recording_${new Date().getTime()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h3>음성 녹음기</h3>
      
      <div style={{ marginBottom: '15px' }}>
        {!isRecording ? (
          <button onClick={startRecording}>녹음 시작</button>
        ) : (
          <button onClick={stopRecording} style={{ color: 'red' }}>녹음 중지</button>
        )}
      </div>

      {audioUrl && (
        <div>
          <p>녹음 완료!</p>
          <audio src={audioUrl} controls />
          <br />
          <button onClick={downloadAudio} style={{ marginTop: '10px' }}>
            파일 저장하기
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;