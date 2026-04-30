import React from 'react';
import '../css/AdminLogs.css';


const LOG_TYPE_CONFIG = {
  Router: { color: '#4A90E2', label: 'ROUTER' },
  Auth: { color: '#7ED321', label: 'AUTH' },
  STT_Engine: { color: '#F5A623', label: 'STT_ENG' },
  Acoustic: { color: '#D0021B', label: 'ACOUST' },
  Inference: { color: '#BD10E0', label: 'INFER' },
  Default: { color: '#A0AEC0', label: 'SYSTEM' }
};

const AdminLogs = () => {
  // 1. Mock 데이터: 실시간 로그 기록 
  const mockLogs = [
    { id: 1, time: '2026-04-25 12:40:11', type: 'Router', msg: 'POST /api/v2/analyze/voice - Payload: 1.2MB' },
    { id: 2, time: '2026-04-25 12:40:12', type: 'Auth', msg: 'Validating Bearer token... OK' },
    { id: 3, time: '2026-04-25 12:40:15', type: 'STT_Engine', msg: 'Result: "어제 점심은 햄버거 먹을까?"'},
    { id: 4, time: '2026-04-25 12:41:00', type: 'Acoustic', msg: '[WARN] Sarcastic drawl detected (intensity: +40%)' },
    { id: 5, time: '2026-04-25 12:41:05', type: 'Inference', msg: 'Contextual polarity inversion detected. -> SARCASM_DETECTED' },
    { id: 6, time: '2026-04-25 12:43:15', type: 'Router', msg: 'GET /api/v2/user/profile - Success' },
  ];

  // 2. Mock 데이터: 현재 접속 중인 유저
  const mockUsers = [
    { id: 1, name: '홍길동', status: 'active', lastAction: '방금 전' },
    { id: 2, name: '고석현', status: 'active', lastAction: '2분 전' },
    { id: 3, name: '금길동', status: 'idle', lastAction: '15분 전' },
    { id: 4, name: '은길동', status: 'active', lastAction: '5분 전' },
    { id: 5, name: '동길동', status: 'idle', lastAction: '32분 전' },
    { id: 6, name: '풀길동', status: 'active', lastAction: '8분 전' },
  ];

  return (
    <div className="admin-logs-wrapper">
      <div className="admin-logs-container">
        
        {/* 왼쪽 섹션 */}
        <div className="log-monitor-section">
          <div className="section-header">
            <h3>System Real-time Logs</h3>
            <span className="live-indicator">LIVE</span>
          </div>
          <div className="log-screen">
            <div className="log-content">
             
              {[...mockLogs, ...mockLogs].map((log, index) => {
   
                const config = LOG_TYPE_CONFIG[log.type] || LOG_TYPE_CONFIG.Default;
                
                return (
                  <div key={`${log.id}-${index}`} className="log-line">
                    <span className="log-time">[{log.time}]</span>
                    <span className="log-type" style={{ color: config.color }}>
                      [{config.label}]
                    </span>
                    <span className="log-msg">{log.msg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

       
        <div className="user-status-section">
          <div className="user-count-card">
            <span className="card-label">Logged-In Account</span>
            <h3 className="card-number">{mockUsers.length}명</h3>
          </div>
          
          <div className="user-list-container">
            <div className="list-header">Current Online Users</div>
            <div className="user-list">
              {mockUsers.map((user) => (
                <div key={user.id} className="user-item">
                  <div className="user-profile-info">
                    <div className="user-avatar-circle">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#A0AEC0">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div className="user-detail">
                      <span className="user-name-text">{user.name}</span>
                      <span className="last-action-text">{user.lastAction}</span>
                    </div>
                  </div>
                  <div 
                    className={`status-indicator-dot ${user.status}`}
                    title={user.status === 'active' ? '활동 중' : '10분 이상 미활동'}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogs;