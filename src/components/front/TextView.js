import React from 'react';
import '../css/TextView.css'; 

// 각 오디오 ID별 Mock Data
const transcriptData = {
  1: [
    { time: '00:01', text: '1번 파일의 첫 문장입니다.' },
    { time: '00:05', text: '테스트용 데이터입니다.' }
  ],
  2: [
    { time: '00:01', text: '2번 오디오 대화 내용입니다.' }
  ],
  3: [
    { time: '00:01', text: '안녕하세요 홍길동 입니다.' },
    { time: '00:04', text: '택배 문제로 연락 드렸는데요.' },
    { time: '00:06', text: '저번에 제가 받은 택배가 오지 않아서요.' }
  ],
  
};

const TextView = ({ audioId }) => {
  const currentTranscript = transcriptData[audioId] || [{ time: '-', text: '텍스트 데이터가 없습니다.' }];

  return (
    <div className="text-view-container">
      {currentTranscript.map((item, index) => (
        <div key={index} className="transcript-line">
          <span className="transcript-time">{item.time}</span>
          <span className="transcript-text">{item.text}</span>
        </div>
      ))}
    </div>
  );
};

export default TextView;