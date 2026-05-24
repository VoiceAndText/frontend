import React from 'react';
import '../css/TextView.css'; 

const TextView = ({ audioId, analysisResult }) => {
  
  // 🚨 1. 가장 중요한 철벽 방어 로직! (무조건 컴포넌트 최상단에 있어야 합니다)
  // 데이터가 아예 없거나(null), 아직 분석 결과가 안 왔다면 여기서 안전하게 렌더링을 멈춥니다.
  if (!analysisResult || !analysisResult.timeSeriesAnalysis) {
    return (
      <div className="text-view-container analysis-scroll-area">
        <div className="transcript-line">
          <span className="transcript-text">데이터를 불러오는 중이거나 텍스트가 없습니다.</span>
        </div>
      </div>
    );
  }

  // 💡 2. 위에서 null 검사를 무사히 통과했으므로, 이제 안심하고 데이터를 꺼내 씁니다.
  const timeSeries = analysisResult.timeSeriesAnalysis;

  // 💡 3. 시간 변환 함수
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