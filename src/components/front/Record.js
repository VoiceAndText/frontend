import React, { useState, useRef, useEffect } from 'react';
import '../css/Record.css';

const Record = ({ onRecordComplete }) => {
  const [recordingState, setRecordingState] = useState('inactive');
  const [elapsedTime, setElapsedTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);

  const animationRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const durationRef = useRef(0);
  const recordingStateRef = useRef('inactive');

  const updateRecordingState = (newState) => {
    setRecordingState(newState);
    recordingStateRef.current = newState;
  };

  const formatStopwatch = (ms) => {
    const totalSeconds = Math.max(0, ms) / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // inactive 상태면 애니메이션 루프 종료
      if (recordingStateRef.current === 'inactive') return;
      
      animationRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 핵심 수정: recording 상태일 때만 데이터를 가져와서 그림
      if (recordingStateRef.current === 'recording') {
        analyser.getByteFrequencyData(dataArray);

        const displayBins = 50;
        const barSpacing = (width / 2) / displayBins;
        ctx.fillStyle = '#ffffff';

        for (let i = 0; i < displayBins; i++) {
          let barHeight = (dataArray[i] / 255) * (height / 2) * 0.9;
          if (barHeight < 2) barHeight = 2;
          
          ctx.fillRect((width / 2) + (i * barSpacing), (height / 2) - barHeight, 1.5, barHeight * 2);
          if (i !== 0) {
            ctx.fillRect((width / 2) - (i * barSpacing), (height / 2) - barHeight, 1.5, barHeight * 2);
          }
        }
      } 
      // paused 상태일 때는 ctx.clearRect에 의해 빈 화면이 유지됨
    };
    draw();
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const nextTime = prev + 100;
        durationRef.current = nextTime;
        if (nextTime >= 60000) { stopRecording(); return 60000; }
        return nextTime;
      });
    }, 100);
  };

  const startRecording = async () => {
    if (recordingState === 'paused' && mediaRecorderRef.current) {
      mediaRecorderRef.current.resume();
      updateRecordingState('recording');
      startTimer();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          const audioFile = new File([audioBlob], "녹음된 오디오.webm", { type: 'audio/webm' });
          onRecordComplete(audioFile, durationRef.current / 1000);
        }
      };

      mediaRecorder.start(100);
      updateRecordingState('recording');
      setElapsedTime(0);
      durationRef.current = 0;
      startTimer();

      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.width = canvasRef.current.offsetWidth * 2;
          canvasRef.current.height = canvasRef.current.offsetHeight * 2;
          drawWaveform();
        }
      }, 50);
    } catch (err) {
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      updateRecordingState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      updateRecordingState('inactive');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="record-block">
      {recordingState === 'inactive' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', paddingTop: '40px' }}>
          <div style={{ marginBottom: '60px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '15px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              1번에 분석 가능한 녹음은 최대 1분입니다.
            </p>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '140px', height: '140px', marginTop: '20px' }}>
            <div style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)' }}></div>
            <button onClick={startRecording} style={{ position: 'relative', zIndex: 10, width: '74px', height: '74px', borderRadius: '50%', backgroundColor: '#a875ff', border: 'none', cursor: 'pointer' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff', marginBottom: '20px', fontVariantNumeric: 'tabular-nums' }}>
            {formatStopwatch(elapsedTime)}
          </h1>

          <div style={{ width: '90%', height: '120px', marginBottom: '30px' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={startRecording} disabled={recordingState === 'recording'} style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', opacity: recordingState === 'recording' ? 0.4 : 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </button>

            <button onClick={pauseRecording} disabled={recordingState !== 'recording'} style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', opacity: recordingState !== 'recording' ? 0.4 : 1 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            </button>

            <button onClick={stopRecording} style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Record;