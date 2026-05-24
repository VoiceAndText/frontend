import React from 'react';
import '../css/TextView.css'; 

const TextView = ({ audioId, analysisResult }) => {
  if (!analysisResult || !analysisResult.timeSeriesAnalysis) {
    return (
      <div className="text-view-container analysis-scroll-area">
        <div className="transcript-line">
          <span className="transcript-text">데이터를 불러오는 중이거나 텍스트가 없습니다.</span>
        </div>
      </div>
    );
  }

  const timeSeries = analysisResult.timeSeriesAnalysis;

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

  return (
    <div className="text-view-container analysis-scroll-area">
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