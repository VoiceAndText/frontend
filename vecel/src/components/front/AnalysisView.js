import React, { useState } from 'react';
import '../css/AnalysisView.css';

const sentenceAnalysisData = {
  3: [
    { sentence: "안녕하세요, 홍길동 입니다. (00:01~00:04)", evaluation: "반어법, 감정 불일치", stressIndex: 82, confidence: [{ label: "분노", value: 48.8, color: "#6a5acd" }, { label: "중립", value: 24.3, color: "#9896b5" }, { label: "슬픔", value: 14.6, color: "#b1accf" }, { label: "행복", value: 12.3, color: "#d1cff1" }] },
    { sentence: "택배 문제로 연락 드렸는데요. (00:04~00:06)", evaluation: "불만 표출, 직접적 감정", stressIndex: 65, confidence: [{ label: "분노", value: 55.0, color: "#6a5acd" }, { label: "중립", value: 30.0, color: "#9896b5" }, { label: "슬픔", value: 10.0, color: "#b1accf" }, { label: "행복", value: 5.0, color: "#d1cff1" }] },
    { sentence: "저번에 제가 받은 택배가 오지 않아서요. (00:06~00:10)", evaluation: "의문 제기, 중립적 태도", stressIndex: 42, confidence: [{ label: "중립", value: 60.5, color: "#9896b5" }, { label: "슬픔", value: 20.2, color: "#b1accf" }, { label: "분노", value: 15.3, color: "#6a5acd" }, { label: "행복", value: 4.0, color: "#d1cff1" }] },
    // 마지막 4페이지: 시계열 스트레스 분석 데이터
    { 
      isFinal: true, 
      timeSeries: [
        { time: 0, stress: 10 }, { time: 10, stress: 40 }, { time: 20, stress: 58 }, 
        { time: 30, stress: 62 }, { time: 40, stress: 68 }, { time: 50, stress: 60 }, { time: 60, stress: 78 }
      ]
    }
  ]
};

const AnalysisView = ({ audioId, analysisResult }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dataList = analysisResult || sentenceAnalysisData[audioId] || [];
  const currentData = dataList[currentIndex];

  if (!currentData) return <div className="empty-msg">분석 데이터가 없습니다.</div>;

  // --- [시계열 분석 페이지 로직] ---
  if (currentData.isFinal) {
    const pts = currentData.timeSeries;
    const topPt = pts.reduce((prev, curr) => prev.stress > curr.stress ? prev : curr);
    const bottomPt = pts.reduce((prev, curr) => prev.stress < curr.stress ? prev : curr);
    
    // 최대 증가율 구간 및 문장 감지 로직
    let maxIncRate = 0;
    let incRange = "";
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].stress > pts[i-1].stress) {
        const rate = (((pts[i].stress - pts[i-1].stress) / pts[i-1].stress) * 100).toFixed(1);
        if (parseFloat(rate) > maxIncRate) {
          maxIncRate = parseFloat(rate);
          incRange = `${pts[i-1].time}초 ~ ${pts[i].time}초`;
        }
      }
    }

    const chartW = 500;
    const chartH = 220; // 콤팩트한 높이
    const padding = 45;
    
    // 점 좌표 계산
    const points = pts.map((p, i) => ({
      x: padding + (p.time / pts[pts.length-1].time * (chartW - padding * 2)),
      y: (chartH - padding) - (p.stress / 100 * (chartH - padding * 2))
    }));
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="analysis-view-container">
        <div className="analysis-header">
          <h4>시계열 스트레스 분석 그래프</h4>
          <div className="pagination-controls">
            <button onClick={() => setCurrentIndex(currentIndex - 1)}>&lt;</button>
            <span>{currentIndex + 1} / {dataList.length}</span>
            <button disabled>&gt;</button>
          </div>
        </div>

        <div className="time-series-content">
          <div className="svg-line-chart-wrapper-compact">
            <svg width="100%" height="100%" viewBox={`0 0 ${chartW} ${chartH}`}>
              {/* Y축 그리드 (10 단위) */}
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => {
                const y = (chartH - padding) - (v / 100 * (chartH - padding * 2));
                return (
                  <g key={v}>
                    <line x1={padding} y1={y} x2={chartW - padding} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                    <text x={padding - 10} y={y + 3} textAnchor="end" className="chart-axis-text-sm">{v}</text>
                  </g>
                );
              })}
              
              {/* X축 그리드 (5초 단위) */}
              {Array.from({ length: Math.floor(pts[pts.length-1].time / 5) + 1 }).map((_, i) => {
                const t = i * 5;
                const x = padding + (t / pts[pts.length-1].time * (chartW - padding * 2));
                return (
                  <g key={t}>
                    <line x1={x} y1={padding} x2={x} y2={chartH - padding} stroke="#f8f8f8" strokeWidth="1" />
                    <text x={x} y={chartH - padding + 18} textAnchor="middle" className="chart-axis-text-sm">{t}s</text>
                  </g>
                );
              })}

              <path d={linePath} fill="none" stroke="#b1accf" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="5" fill="#a09db9" stroke="#fff" strokeWidth="2" />
              ))}
            </svg>
          </div>

          <div className="analysis-footer-summary">
            <h5>시계열 데이터 기반 종합 분석</h5>
            <p className="summary-text">
              본 녹음에서 스트레스가 가장 높았던 시점은 <strong>{topPt.time}초({topPt.stress})</strong>이며, 
              가장 낮았던 시점은 <strong>{bottomPt.time}초({bottomPt.stress})</strong>로 확인되었습니다. <br />
              특히 <strong>{incRange}</strong> 구간에서 스트레스 수치가 이전 대비 <strong>{maxIncRate}%</strong> 급격히 상승하였으므로 해당 시점의 발언을 확인하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- [일반 문장 분석 렌더링 영역] ---
  const topEmotion = currentData.confidence.reduce((prev, curr) => (prev.value > curr.value) ? prev : curr);
  const size = 200; const center = size / 2; const radius = 70; const circumference = 2 * Math.PI * radius; let cumulativeValue = 0;

  return (
    <div className="analysis-view-container">
      <div className="analysis-header">
        <h4>멀티 모달 반어법 분석 결과</h4>
        <div className="pagination-controls">
          <button onClick={() => setCurrentIndex(prev => prev - 1)} disabled={currentIndex === 0}>&lt;</button>
          <span>{currentIndex + 1} / {dataList.length}</span>
          <button onClick={() => setCurrentIndex(prev => prev + 1)} disabled={currentIndex === dataList.length - 1}>&gt;</button>
        </div>
      </div>
      <div className="analysis-content">
        <div className="analysis-text-info">
          <p className="sentence-text">{currentIndex + 1}. {currentData.sentence}</p>
          <div className="info-row"><span className="info-label">문장 감정 분석 종합 평가 :</span><strong className="info-val">{currentData.evaluation}</strong></div>
          <div className="info-row"><span className="info-label">스트레스 지수 :</span><span className="stress-val">{currentData.stressIndex} / 100</span></div>
          <div className="emotion-legend-section">
            <p className="info-label">감정별 모델 확신도 (Confidence)</p>
            <ul className="emotion-legend">
              {currentData.confidence.map((emo, idx) => (
                <li key={idx}><span className="dot" style={{ backgroundColor: emo.color }}></span>{emo.label} : {emo.value}%</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="analysis-chart-visual">
          <div className="svg-chart-wrapper">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
              {currentData.confidence.map((emo, idx) => {
                const strokeDashactive = (emo.value / 100) * circumference;
                const strokeDashoffset = circumference - (cumulativeValue / 100) * circumference + (circumference * 0.25);
                const angle = ((cumulativeValue + emo.value / 2) / 100) * 360 - 90;
                const radians = (angle * Math.PI) / 180;
                const tx = center + radius * Math.cos(radians); const ty = center + radius * Math.sin(radians);
                cumulativeValue += emo.value;
                return (
                  <g key={idx}>
                    <circle cx={center} cy={center} r={radius} fill="transparent" stroke={emo.color} strokeWidth="35" strokeDasharray={`${strokeDashactive} ${circumference - strokeDashactive}`} strokeDashoffset={strokeDashoffset} />
                    {emo.value > 8 && <text x={tx} y={ty} fill={idx === 0 ? "white" : "#444"} fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">{emo.value}%</text>}
                  </g>
                );
              })}
              <circle cx={center} cy={center} r={45} fill="white" />
            </svg>
            <div className="chart-center-text"><span>모델 확신도</span></div>
          </div>
        </div>
      </div>
      <div className="analysis-footer-summary">
        <h5>분석 결과 요약</h5>
        <p className="summary-text">해당 문장에 대해 모델은 <strong>{topEmotion.label}</strong> 감정을 약 <strong>{topEmotion.value}%</strong>의 확률로 가장 높게 확신하고 있습니다.</p>
      </div>
    </div>
  );
};

export default AnalysisView;

/* ==========================================================================
  [ 백엔드 API 연동을 위한 데이터 규격 요약 (API Data Specification) ]
  ==========================================================================

  1. Endpoint 예시: GET /api/analysis/{audioId}
  
  2. JSON 데이터 구조 (Response Body):
     {
       "audioId": number,           // 음성 파일 고유 ID
       "analysisResults": [         // 문장별 분석 결과 배열 (dataList)
         {
           "sentence": string,      // 분석된 문장 내용 및 타임스탬프 (예: "안녕하세요... (00:01~00:04)")
           "evaluation": string,    // 문장 감정 분석 종합 평가 (예: "반어법, 감정 불일치")
           "stressIndex": number,   // 스트레스 지수 (0~100 사이 정수)
           "confidence": [          // 감정별 모델 확신도 배열 (SVG 차트 및 범례 데이터)
             { 
               "label": string,     // 감정 이름 (분노, 중립, 슬픔, 행복 등)
               "value": number,     // 확신도 퍼센트 (합계가 100이 되도록 권장)
               "color": string      // UI에 표시될 색상 코드 (예: "#6a5acd")
             }
           ]
         }
       ]
     }

  3. 프론트엔드 적용 시 주의사항:
     - 현재 코드의 'sentenceAnalysisData' 객체 구조에서 [audioId] 키를 통해 접근하는 방식을 
       API 응답 값으로 대체해야 합니다.
     - 'confidence' 배열 내의 'value' 필드는 SVG 수식 계산(circumference)에 직접 사용되므로 
       반드시 숫자(Number) 타입으로 전달되어야 합니다.
     - 페이지네이션 기능을 위해 'analysisResults' 배열의 순서는 문장 발생 시간 순서대로 정렬되어야 합니다.
  ==========================================================================
*/