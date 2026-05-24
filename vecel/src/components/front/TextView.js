import React from 'react';
import '../css/TextView.css'; 

const TextView = ({ audioId, analysisResult }) => {
  const formatStartTime = (timeRangeStr) => {
    try {
      const startStr = timeRangeStr.split('-')[0].replace('s', '').trim();
      const seconds = Math.floor(parseFloat(startStr));
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    } catch (e) {
      return "00:00";
    }
  };

  const timeSeries = analysisResult.timeSeriesAnalysis;

  return (
    // 💡 5. AnalysisView에서 썼던 스크롤 클래스(analysis-scroll-area)를 여기에 추가하면 내용이 길어도 잘 스크롤됩니다.
    <div className="text-view-container analysis-scroll-area">
      {/* 💡 6. 가짜 데이터 대신 실제 배열(timeSeries)을 돌립니다. 클래스명은 원본을 그대로 씁니다! */}
      {timeSeries.map((item, index) => (
        <div key={index} className="transcript-line">
          <span className="transcript-time">{formatStartTime(item.time_range)}</span>
          <span className="transcript-text">{item.stt_chunk}</span>
        </div>
      ))}
    </div>
  );
};

export default TextView;