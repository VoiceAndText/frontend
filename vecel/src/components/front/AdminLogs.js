import React, { useState, useEffect, useMemo } from 'react';
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
  const [filterStatus, setFilterStatus] = useState('ALL');
  const size = 20;

  const fetchLogs = async (pageNumber) => {
    try {
      const response = await fetchWithAuth(`/api/v1/admin/logs?page=${pageNumber}&size=${size}&sort=createdAt,desc`, {
        method: 'GET'
      });

      const resBody = await response.json();

      if (resBody && resBody.code === "UNAUTHORIZED") {
        console.error("인증 실패 사유:", resBody.message);
        alert("관리자 인증 정보가 올바르지 않습니다. 다시 로그인해 주세요.");
        sessionStorage.clear();
        window.location.href = '/';
        return;
      }

      if (resBody && resBody.success) {
        const serverData = resBody.data;
        if (serverData && serverData.content) {
          setLogs(serverData.content);
          setTotalPages(serverData.totalPages || 0);
        }
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

  const logStats = useMemo(() => {
    const total = logs.length;
    const failed = logs.filter(l => l.status === 'FAILED' || l.errorMessage).length;
    const pending = logs.filter(l => l.status === 'PENDING').length;
    const success = total - failed - pending;
    return { total, success, failed, pending };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (filterStatus === 'ALL') return logs;
    if (filterStatus === 'FAILED') return logs.filter(l => l.status === 'FAILED' || l.errorMessage);
    if (filterStatus === 'SUCCESS') return logs.filter(l => l.status !== 'FAILED' && !l.errorMessage && l.status !== 'PENDING');
    return logs.filter(log => log.status === filterStatus);
  }, [logs, filterStatus]);

  if (loading) {
    return <div className="admin-logs-wrapper" style={{ color: '#1a202c' }}>Loading System Logs...</div>;
  }

  return (
    <div className="admin-logs-wrapper">
      <div className="admin-logs-container">
        
        <div className="log-dashboard-header">
          <h2>System Log Center</h2>
        </div>

        <div className="log-summary-cards">
          <div className="summary-card">
            <div className="summary-card-label">Current Page Logs</div>
            <div className="summary-card-value">{logStats.total}건</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Success Logs</div>
            <div className="summary-card-value" style={{ color: '#48bb78' }}>{logStats.success}건</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Failed Logs</div>
            <div className="summary-card-value" style={{ color: '#e53e3e' }}>{logStats.failed}건</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Pending Logs</div>
            <div className="summary-card-value" style={{ color: '#ecc94b' }}>{logStats.pending}건</div>
          </div>
        </div>

        <div className="log-monitor-section">
          <div className="section-header">
            <h3>System Analysis Logs</h3>
            <div className="header-controls">
              <select 
                className="log-filter-select" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">모든 로그 항목</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING">PENDING</option>
              </select>
              <span className="live-indicator">LIVE</span>
            </div>
          </div>
          
          <div className="log-screen">
            <div className="log-content">
              {filteredLogs.map((log) => {
                let currentStatus = log.status;
                if ((log.status === 'SYSTEM' || !log.status) && log.errorMessage) {
                  currentStatus = 'FAILED';
                } else if (log.status === 'SYSTEM' && !log.errorMessage) {
                  currentStatus = 'SUCCESS';
                }
                
                const config = LOG_TYPE_CONFIG[currentStatus] || LOG_TYPE_CONFIG.Default;
                
                const dateText = log.createdAt ? (() => {
                  const utcDate = log.createdAt.endsWith('Z') ? log.createdAt : `${log.createdAt}Z`;
                  return new Date(utcDate).toLocaleTimeString('ko-KR');
                })() : 'UNKNOWN TIME';
                
                return (
                  <div key={log.analysisRequestId} className="log-line">
                    <div className="log-meta">
                      <span className="log-time">[{dateText}]</span>
                      <span className="log-type" style={{ color: config.color }}>
                        [{config.label}]
                      </span>
                    </div>
                    <span className="log-msg">
                      [User ID: {log.userId || 'N/A'}] [{log.sourceType || 'UNKNOWN'}] 
                      {log.errorMessage ? ` Error: ${log.errorMessage}` : ' Analysis requested successfully.'}
                    </span>
                  </div>
                );
              })}
              {filteredLogs.length === 0 && (
                <div className="log-line" style={{ color: '#718096', border: 'none' }}>No logs found.</div>
              )}
            </div>
          </div>

          <div className="log-pagination">
            <button 
              onClick={handlePrevPage} 
              disabled={page === 0}
              style={{ cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
            >
              이전
            </button>
            <span style={{ color: '#fff', fontSize: '13px' }}>{page + 1} / {totalPages || 1}</span>
            <button 
              onClick={handleNextPage} 
              disabled={page >= totalPages - 1}
              style={{ cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1 }}
            >
              다음
            </button>
          </div>

        </div>

        <footer className="log-dashboard-footer">
          © 2026 Admin Dashboard. All rights reserved.
        </footer>

      </div>
    </div>
  );
};

export default AdminLogs;
