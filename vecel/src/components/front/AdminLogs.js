import React, { useState, useEffect } from 'react';
import '../css/AdminLogs.css';
import { fetchWithAuth } from './api';

const LOG_TYPE_CONFIG = {
  PENDING: { color: '#F5A623', label: 'PENDING' },
  SUCCESS: { color: '#7ED321', label: 'SUCCESS' },
  FAILED: { color: '#D0021B', label: 'FAILED' },
  Default: { color: '#A0AEC0', label: 'SYSTEM' }
};

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 20;

  const fetchLogs = async (pageNumber) => {
    try {
      // 도메인 중복을 방지하기 위해 앞부분을 제거하고 경로만 전달합니다.
      const res = await fetchWithAuth(`/api/v1/admin/logs?page=${pageNumber}&size=${size}&sort=createdAt,desc`, {
        method: 'GET'
      });

      const serverData = res.data ? res.data : res;

      if (serverData && serverData.content) {
        setLogs(serverData.content);
        setTotalPages(serverData.totalPages || 0);
      }
    } catch (error) {
      console.error('로그 내역 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  if (loading) {
    return <div className="admin-logs-wrapper"><div style={{ color: '#fff', padding: '20px' }}>Loading System Logs...</div></div>;
  }

  return (
    <div className="admin-logs-wrapper">
      <div className="admin-logs-container" style={{ display: 'block' }}>
        
        <div className="log-monitor-section" style={{ width: '100%' }}>
          <div className="section-header">
            <h3>System Analysis Logs</h3>
            <span className="live-indicator">LIVE</span>
          </div>
          
          <div className="log-screen">
            <div className="log-content">
              {logs.map((log) => {
                const config = LOG_TYPE_CONFIG[log.status] || LOG_TYPE_CONFIG.Default;
                const dateText = log.createdAt ? new Date(log.createdAt).toLocaleString() : 'UNKNOWN TIME';
                
                return (
                  <div key={log.analysisRequestId} className="log-line">
                    <span className="log-time">[{dateText}]</span>
                    <span className="log-type" style={{ color: config.color }}>
                      [{config.label}]
                    </span>
                    <span className="log-msg">
                      [User ID: {log.userId}] [{log.sourceType}] 
                      {log.errorMessage ? ` Error: ${log.errorMessage}` : ' Analysis requested successfully.'}
                    </span>
                  </div>
                );
              })}
              {logs.length === 0 && (
                <div className="log-line" style={{ color: '#718096' }}>No logs found.</div>
              )}
            </div>
          </div>

          <div className="log-pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px', gap: '10px' }}>
            <button 
              onClick={handlePrevPage} 
              disabled={page === 0}
              style={{ padding: '6px 12px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
            >
              이전
            </button>
            <span style={{ color: '#fff' }}>{page + 1} / {totalPages || 1}</span>
            <button 
              onClick={handleNextPage} 
              disabled={page >= totalPages - 1}
              style={{ padding: '6px 12px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
            >
              다음
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogs;
