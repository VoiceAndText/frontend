import React, { useState } from 'react';
import '../css/AnalysisView.css';

const AnalysisView = ({ audioId, analysisResult }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!analysisResult || !analysisResult.timeSeriesAnalysis || analysisResult.timeSeriesAnalysis.length === 0) {
    return <div className="empty-msg">분석 데이터가 없습니다.</div>;
  }

  const { primaryEmotion, dissonanceIndex, timeSeriesAnalysis } = analysisResult;
  
  const totalPages = timeSeriesAnalysis.length + 1;
  const isSummaryPage = currentIndex === timeSeriesAnalysis.length;

  return (
    <div className="analysis-view-container">
      <div className="analysis-header">
        <h4>{isSummaryPage ? '시계열 스트레스 분석 그래프' : '멀티 모달 반어법 분석 결과'}</h4>
        <div className="pagination-controls">
          <button onClick={() => setCurrentIndex(prev => prev - 1)} disabled={currentIndex === 0}>&lt;</button>
          <span>{currentIndex + 1} / {totalPages}</span>
          <button onClick={() => setCurrentIndex(prev => prev + 1)} disabled={currentIndex === totalPages - 1}>&gt;</button>
        </div>
      </div>

      <div className="analysis-scroll-area">
        
        {isSummaryPage ? (
          <SummaryChartView 
            pts={timeSeriesAnalysis} 
            primaryEmotion={primaryEmotion} 
            dissonanceIndex={dissonanceIndex} 
          />
        ) : (
          <SentenceDetailView 
            currentData={timeSeriesAnalysis[currentIndex]} 
            index={currentIndex} 
          />
        )}
        
      </div>
    </div>
  );
};

const SummaryChartView = ({ pts, primaryEmotion, dissonanceIndex }) => {
  const topPt = pts.reduce((prev, curr) => prev.dissonance_score > curr.dissonance_score ? prev : curr);

  const chartW = 500;
  const chartH = 220;
  const padding = 45;
  
  const points = pts.map((p, i) => ({
    x: padding + (i / (pts.length - 1 || 1) * (chartW - padding * 2)),
    y: (chartH - padding) - (p.dissonance_score / 100 * (chartH - padding * 2))
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="time-series-content">
      <div className="svg-line-chart-wrapper-compact">
        <svg width="100%" height="100%" viewBox={`0 0 ${chartW} ${chartH}`}>
          {[0, 20, 40, 60, 80, 100].map(v => {
            const y = (chartH - padding) - (v / 100 * (chartH - padding * 2));
            return (
              <g key={v}>
                <line x1={padding} y1={y} x2={chartW - padding} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <text x={padding - 10} y={y + 3} textAnchor="end" className="chart-axis-text-sm" fill="#999" fontSize="10">{v}</text>
              </g>
            );
          })}
          
          {pts.map((p, i) => {
            const x = padding + (i / (pts.length - 1 || 1) * (chartW - padding * 2));
            const rawTime = p.time_range.split('-')[0].trim(); 
            const numericTime = parseFloat(rawTime.replace('s', ''));
            const timeLabel = !isNaN(numericTime) ? `${Math.round(numericTime)}s` : rawTime;
            return (
              <g key={i}>
                <text x={x} y={chartH - padding + 18} textAnchor="middle" className="chart-axis-text-sm" fill="#999" fontSize="10">{timeLabel}</text>
              </g>
            );
          })}

          <path d={linePath} fill="none" stroke="#b1accf" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6a5acd" stroke="#fff" strokeWidth="2" />
          ))}
        </svg>
      </div>

      <div className="analysis-footer-summary" style={{ marginTop: '20px' }}>
        <h5>시계열 데이터 기반 종합 분석</h5>
        <p className="summary-text" style={{ lineHeight: '1.6' }}>
          본 녹음의 평균 감정 불일치 점수는 <strong>{dissonanceIndex}점</strong>이며, 
          최종 종합 결과는 <strong style={{ color: '#6a5acd' }}>[{primaryEmotion}]</strong> 상태로 분석되었습니다. <br />
          가장 감정 불일치 점수가 높았던 구간은 <strong>{topPt.time_range}</strong> (점수: {topPt.dissonance_score}점) 입니다.
        </p>
      </div>
    </div>
  );
};

const SentenceDetailView = ({ currentData, index }) => {
  const score = currentData.dissonance_score;
  const size = 180; 
  const center = size / 2; 
  const radius = 65; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashactive = (score / 100) * circumference;
  const strokeDashoffset = circumference - strokeDashactive;

  return (
    <div className="analysis-content" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="analysis-text-info" style={{ width: '100%' }}>
        <p className="sentence-text" style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px' }}>
          {index + 1}. {currentData.stt_chunk} <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal' }}>({currentData.time_range})</span>
        </p>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1, padding: '15px', backgroundColor: '#f4f5f7', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>텍스트 감정</span>
            <h4 style={{ margin: '5px 0 0', color: '#333' }}>{currentData.text_emotion}</h4>
          </div>
          <div style={{ flex: 1, padding: '15px', backgroundColor: '#f4f5f7', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>음성 어조 감정</span>
            <h4 style={{ margin: '5px 0 0', color: '#333' }}>{currentData.audio_emotion}</h4>
          </div>
        </div>

        <div className="info-row" style={{ fontSize: '1.1rem' }}>
          <span className="info-label">문장 감정 불일치 여부 :</span>
          <strong style={{ color: currentData.is_conflict ? '#ff5e5e' : '#6a5acd', marginLeft: '10px' }}>
            {currentData.is_conflict ? '불일치 (Conflict)' : '일치 (Congruent)'}
          </strong>
        </div>
      </div>

      <div className="analysis-chart-visual" style={{ width: '100%', marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
        <div className="svg-chart-wrapper" style={{ width: `${size}px`, height: `${size}px`, position: 'relative' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={center} cy={center} r={radius} fill="transparent" stroke="#f0f0f0" strokeWidth="15" />
            <circle 
              cx={center} cy={center} r={radius} fill="transparent" 
              stroke={currentData.is_conflict ? "#ff5e5e" : "#b1accf"} 
              strokeWidth="15" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="chart-center-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#999' }}>불일치 점수</span><br/>
            <strong style={{ fontSize: '1.8rem', color: '#333' }}>{score}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;