import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../css/AdminUsers.css';
import { fetchWithAuth } from './api';

const LOG_TYPE_CONFIG = {
  PENDING: { color: '#F5A623', label: 'PENDING' },
  SUCCESS: { color: '#7ED321', label: 'SUCCESS' },
  FAILED: { color: '#D0021B', label: 'FAILED' },
  Default: { color: '#A0AEC0', label: 'SYSTEM' }
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLogs, setUserLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);

  const fetchUserLogs = useCallback(async (userId) => {
    setLogLoading(true);
    try {
      const response = await fetchWithAuth(`/api/v1/admin/users/${userId}/logs?page=0&size=50&sort=createdAt,desc`, {
        method: 'GET'
      });
      const resBody = await response.json();

      if (resBody && resBody.success && resBody.data && resBody.data.content) {
        setUserLogs(resBody.data.content);
      } else {
        setUserLogs([]);
      }
    } catch (error) {
      console.error('개별 사용자 로그 조회 실패:', error);
      setUserLogs([]);
    } finally {
      setLogLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/v1/admin/users?page=0&size=100', {
        method: 'GET'
      });
      const resBody = await response.json();

      if (resBody && resBody.success && resBody.data && resBody.data.content) {
        const userList = resBody.data.content;
        setUsers(userList);
        
        if (userList.length > 0) {
          setSelectedUser(prevSelected => {
            if (!prevSelected) {
              fetchUserLogs(userList[0].userId);
              return userList[0];
            }
            const updatedCurrent = userList.find(u => u.userId === prevSelected.userId);
            return updatedCurrent || prevSelected;
          });
        }
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserLogs]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const handleToggleStatus = async (user) => {
    if (user.status === 'INACTIVE') {
      alert('탈퇴한 계정의 상태는 변경할 수 없습니다.');
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmMessage = nextStatus === 'SUSPENDED' 
      ? `[${user.name}] 사용자를 차단(SUSPENDED)하시겠습니까?`
      : `[${user.name}] 사용자의 차단을 해제(ACTIVE)하시겠습니까?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetchWithAuth(`/api/v1/admin/users/${user.userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      const resBody = await response.json();

      if (resBody && resBody.success) {
        alert('계정 상태가 성공적으로 변경되었습니다.');
        await fetchUsers();
      } else {
        alert(`상태 변경 실패: ${resBody.message || '오류 발생'}`);
      }
    } catch (error) {
      console.error('사용자 상태 변경 통신 에러:', error);
      alert('서버 통신 중 에러가 발생했습니다.');
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchUserLogs(user.userId);
  };

  if (loading) {
    return <div className="admin-users-wrapper"><div style={{ color: '#fff', padding: '20px' }}>Loading Admin User Management...</div></div>;
  }

  return (
    <div className="admin-users-wrapper">
      <div className="admin-users-container">
        
        <div className="accounts-card">
          <div className="card-header">
            <h3>Accounts Management</h3>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="이름 또는 이메일 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-header">
            <span className="col-name">User Info</span>
            <span className="col-setting">Account Status / Action</span>
            <span className="col-log">Inspection</span>
          </div>

          <div className="user-list-rows">
            {filteredUsers.map(user => (
              <div key={user.userId} className={`user-row ${selectedUser && selectedUser.userId === user.userId ? 'selected' : ''}`}>
                <div className="user-profile-col">
                  <div className="row-avatar-fallback">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div className="user-meta-info" style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
                    <span className="user-handle" style={{ fontWeight: 'bold' }}>{user.name || '이름 없음'}</span>
                    <span className="user-email-sub" style={{ fontSize: '11px', color: '#a0aec0' }}>{user.email || '이메일 없음'}</span>
                  </div>
                </div>
                
                <div className="setting-col">
                  {user.status === 'INACTIVE' ? (
                    <span style={{ color: '#e53e3e', fontSize: '13px', fontWeight: 'bold' }}>탈퇴 회원 (INACTIVE)</span>
                  ) : (
                    <button 
                      className={`status-btn ${user.status ? user.status.toLowerCase() : 'active'}`} 
                      onClick={() => handleToggleStatus(user)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: user.status === 'ACTIVE' ? '#2d3748' : '#e53e3e',
                        color: '#fff',
                        border: '1px solid #4a5568',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {user.status === 'ACTIVE' ? '정상 (계정 차단하기)' : '차단됨 (차단 해제하기)'}
                    </button>
                  )}
                </div>
                
                <div className="log-col">
                  <button className="view-log-btn" onClick={() => handleUserSelect(user)}>로그 확인</button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>조회된 회원이 없습니다.</div>
            )}
          </div>
        </div>

        <div className="user-detail-log-section">
          <div className="log-header">
            <h3>Recent Logs: <span className="selected-user-name">{selectedUser ? selectedUser.name : '선택 없음'}</span></h3>
          </div>
          <div className="black-log-screen">
            <div className="terminal-content">
              {logLoading ? (
                <div className="terminal-line"><span className="t-msg" style={{ color: '#a0aec0' }}>Fetching logs from server...</span></div>
              ) : userLogs.length > 0 ? (
                userLogs.map((log) => {
                  const config = LOG_TYPE_CONFIG[log.status] || LOG_TYPE_CONFIG.Default;
                  const logTime = log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : '00:00:00';
                  
                  return (
                    <div key={log.analysisRequestId} className="terminal-line">
                      <span className="t-time">[{logTime}]</span>
                      <span className="t-type" style={{ color: config.color }}>
                        [{config.label}]
                      </span>
                      <span className="t-msg">
                        Request #{log.analysisRequestId} [{log.sourceType}] 
                        {log.errorMessage ? ` - Error: ${log.errorMessage}` : ' - Processed successfully.'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="terminal-line">
                  <span className="t-msg" style={{ color: '#718096' }}>해당 사용자의 분석 로그 기록이 존재하지 않습니다.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;
