import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from './api';

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
    return <div style={{ padding: '20px', color: '#fff' }}>Loading Admin Dashboard Metrics...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Admin Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', border: '1px solid #4a5568' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '5px' }}>Total Active Accounts</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{metrics.totalUsers}명</div>
        </div>
        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', border: '1px solid #4a5568' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '5px' }}>Suspended Accounts</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e53e3e' }}>{metrics.suspendedUsers}명</div>
        </div>
        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', border: '1px solid #4a5568' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '5px' }}>Accumulated Analysis</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4299e1' }}>{metrics.totalRequests}건</div>
        </div>
        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', border: '1px solid #4a5568' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '5px' }}>System Error Rate</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: metrics.errorRate > 10 ? '#e53e3e' : '#48bb78' }}>{metrics.errorRate}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', border: '1px solid #4a5568', minHeight: '300px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Analysis Source Proportion</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '25px' }}>
            {Object.entries(metrics.sourceCounts).map(([source, count]) => {
              const percentage = metrics.totalRequests > 0 ? ((count / metrics.totalRequests) * 100).toFixed(1) : 0;
              return (
                <div key={source}>
                  <div style={{ display: 'flex', justifyContent: 'between', marginBottom: '5px', fontSize: '14px' }}>
                    <span>{source}</span>
                    <span style={{ marginLeft: 'auto', color: '#a0aec0' }}>{count}건 ({percentage}%)</span>
                  </div>
                  <div style={{ background: '#4a5568', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ background: '#3182ce', width: `${percentage}%`, height: '100%', borderRadius: '6px' }}></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(metrics.sourceCounts).length === 0 && (
              <div style={{ textAlign: 'center', color: '#a0aec0', paddingTop: '40px' }}>No analysis record data found.</div>
            )}
          </div>
        </div>

        <div style={{ background: '#2d3748', padding: '20px', borderRadius: '8px', border: '1px solid #4a5568', minHeight: '300px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', color: '#f56565' }}>Critical System Failures</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metrics.recentErrors.map((err) => {
              const logTime = err.createdAt ? (() => {
                const utcDate = err.createdAt.endsWith('Z') ? err.createdAt : `${err.createdAt}Z`;
                return new Date(utcDate).toLocaleTimeString('ko-KR');
              })() : '';

              return (
                <div key={err.analysisRequestId} style={{ background: '#1a202c', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #e53e3e', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'between', color: '#a0aec0', marginBottom: '4px' }}>
                    <span>Req #{err.analysisRequestId} (User ID: {err.userId})</span>
                    <span style={{ marginLeft: 'auto' }}>{logTime}</span>
                  </div>
                  <div style={{ color: '#fc8181', fontWeight: '500' }}>{err.errorMessage || 'Unknown Fatal Error'}</div>
                </div>
              );
            })}
            {metrics.recentErrors.length === 0 && (
              <div style={{ textAlign: 'center', color: '#48bb78', paddingTop: '50px', fontWeight: 'bold' }}>System Healthy. No errors detected.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
