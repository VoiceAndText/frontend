import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from './api';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const disasterRecoveryFetch = async () => {
      try {
        const [usersRes, logsRes] = await Promise.all([
          fetchWithAuth('/api/v1/admin/users?page=0&size=500', { method: 'GET' }),
          fetchWithAuth('/api/v1/admin/logs?page=0&size=500&sort=createdAt,desc', { method: 'GET' })
        ]);

        const usersData = await usersRes.json();
        const logsData = await logsRes.json();

        if (usersData && usersData.success && usersData.data?.content) {
          setUsers(usersData.data.content);
        }
        if (logsData && logsData.success && logsData.data?.content) {
          setLogs(logsData.data.content);
        }
      } catch (error) {
        console.error('대시보드 종합 지표 연동 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    disasterRecoveryFetch();
  }, []);

  const metrics = React.useMemo(() => {
    const totalUsers = users.length;
    const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;
    const totalRequests = logs.length;
    
    const failedLogs = logs.filter(l => l.status === 'FAILED' || l.errorMessage);
    const errorRate = totalRequests > 0 ? ((failedLogs.length / totalRequests) * 100).toFixed(1) : 0;

    const sourceCounts = logs.reduce((acc, log) => {
      if (log.sourceType) acc[log.sourceType] = (acc[log.sourceType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers,
      suspendedUsers,
      totalRequests,
      errorRate,
      sourceCounts,
      recentErrors: failedLogs.slice(0, 5)
    };
  }, [users, logs]);

  if (loading) {
    return <div className="dashboard-wrapper" style={{ color: '#1a202c' }}>Loading Admin Dashboard Metrics...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        
        <div className="summary-cards">
          <div className="metric-card">
            <div className="metric-label">Total Active Accounts</div>
            <div className="metric-number">{metrics.totalUsers}명</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Suspended Accounts</div>
            <div className="metric-number" style={{ color: '#e53e3e' }}>{metrics.suspendedUsers}명</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Accumulated Analysis</div>
            <div className="metric-number" style={{ color: '#4299e1' }}>{metrics.totalRequests}건</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">System Error Rate</div>
            <div className="metric-number" style={{ color: metrics.errorRate > 10 ? '#e53e3e' : '#48bb78' }}>
              {metrics.errorRate}%
            </div>
          </div>
        </div>

        <div className="details-section">
          <div className="detail-block">
            <h3>Analysis Source Proportion</h3>
            <div className="source-list">
              {Object.entries(metrics.sourceCounts).map(([source, count]) => {
                const percentage = metrics.totalRequests > 0 ? ((count / metrics.totalRequests) * 100).toFixed(1) : 0;
                return (
                  <div key={source}>
                    <div className="source-item-header">
                      <span>{source}</span>
                      <span style={{ color: '#a0aec0' }}>{count}건 ({percentage}%)</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(metrics.sourceCounts).length === 0 && (
                <div className="empty-text">No analysis record data found.</div>
              )}
            </div>
          </div>

          <div className="detail-block">
            <h3 style={{ color: '#f56565' }}>Critical System Failures</h3>
            <div className="error-list">
              {metrics.recentErrors.map((err) => {
                const logTime = err.createdAt ? (() => {
                  const utcDate = err.createdAt.endsWith('Z') ? err.createdAt : `${err.createdAt}Z`;
                  return new Date(utcDate).toLocaleTimeString('ko-KR');
                })() : '';

                return (
                  <div key={err.analysisRequestId} className="error-item">
                    <div className="error-item-header">
                      <span>Req #{err.analysisRequestId} (User ID: {err.userId})</span>
                      <span>{logTime}</span>
                    </div>
                    <div style={{ color: '#fc8181', fontWeight: '500' }}>
                      {err.errorMessage || 'Unknown Fatal Error'}
                    </div>
                  </div>
                );
              })}
              {metrics.recentErrors.length === 0 && (
                <div className="empty-text" style={{ color: '#48bb78', fontWeight: 'bold', paddingTop: '20px' }}>
                  System Healthy. No errors detected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <footer className="dashboard-footer">
        © 2026 Admin Dashboard. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
