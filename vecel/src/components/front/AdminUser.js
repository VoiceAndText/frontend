import React, { useState, useMemo } from 'react';
import '../css/AdminUsers.css';

const TYPE_CONFIG = {
  Router: { color: '#4A90E2', label: 'ROUTER' },
  Auth: { color: '#7ED321', label: 'AUTH' },
  STT: { color: '#F5A623', label: 'STT' },
  NLP: { color: '#BD10E0', label: 'NLP' },
  Inference: { color: '#48BB78', label: 'INFER' },
  Default: { color: '#A0AEC0', label: 'LOG' }
};

const AdminUsers = () => {
  const [users, setUsers] = useState([
    { id: 1, handle: '@maddison_c21', status: 'Up', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, handle: '@karl.will02', status: 'Up', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, handle: '@abraham47.y', status: 'Up', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, handle: '@simmmple.web', status: 'Up', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, handle: '@ape.vpp8', status: 'Down', avatar: 'https://i.pravatar.cc/150?u=5' },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(users[0]);

  // 검색 필터링
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);


  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'Up' ? 'Down' : 'Up';
    if (window.confirm(`[${user.handle}] 상태를 ${nextStatus}으로 변경하시겠습니까?`)) {
      setUsers(users.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    }
  };


  const mockUserLogs = [
    { id: 101, time: '10:22:14', type: 'Router', msg: 'POST /api/v2/analyze/voice - 0.8MB' },
    { id: 102, time: '10:22:15', type: 'Auth', msg: 'Validating token... OK' },
    { id: 103, time: '10:23:40', type: 'STT', msg: 'Result: "회의 내용을 요약해줘"' },
    { id: 104, time: '10:23:45', type: 'NLP', msg: 'Sentiment: POSITIVE (0.88)' },
    { id: 105, time: '10:23:50', type: 'Inference', msg: 'Normal speech detected.' },
  ];

  return (
    <div className="admin-users-wrapper">
      <div className="admin-users-container">
        
   
        <div className="accounts-card">
          <div className="card-header">
            <h3>Accounts</h3>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-header">
            <span className="col-name">Name</span>
            <span className="col-setting">Setting</span>
            <span className="col-log">Log</span>
          </div>

          <div className="user-list-rows">
            {filteredUsers.map(user => (
              <div key={user.id} className={`user-row ${selectedUser.id === user.id ? 'selected' : ''}`}>
                <div className="user-profile-col">
                  <img src={user.avatar} alt="avatar" className="row-avatar" />
                  <span className="user-handle">{user.handle}</span>
                </div>
                <div className="setting-col">
                  <button className={`status-btn ${user.status.toLowerCase()}`} onClick={() => handleToggleStatus(user)}>
                    {user.status} {user.status === 'Up' ? '▲' : '▼'}
                  </button>
                </div>
                <div className="log-col">
                  <button className="view-log-btn" onClick={() => setSelectedUser(user)}>로그 확인</button>
                </div>
              </div>
            ))}
          </div>
        </div>

   
        <div className="user-detail-log-section">
          <div className="log-header">
            <h3>Recent 24h Logs: <span className="selected-user-name">{selectedUser.handle}</span></h3>
          </div>
          <div className="black-log-screen">
            <div className="terminal-content">
              {[...mockUserLogs, ...mockUserLogs].map((log, idx) => {
           
                const config = TYPE_CONFIG[log.type] || TYPE_CONFIG.Default;
                
                return (
                  <div key={idx} className="terminal-line">
                    <span className="t-time">[{log.time}]</span>
                    <span className="t-type" style={{ color: config.color }}>
                      [{config.label}]
                    </span>
                    <span className="t-msg">{log.msg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;