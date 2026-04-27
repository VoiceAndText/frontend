import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../css/Dashboard.css';

// 차트에 들어갈 가짜(Mock) 데이터
const data = [
  { name: '1', value: 20 }, { name: '2', value: 30 }, { name: '3', value: 50 },
  { name: '4', value: 30 }, { name: '5', value: 55 }, { name: '6', value: 85 },
  { name: '7', value: 35 }, { name: '8', value: 50 }, { name: '9', value: 45 },
  { name: '10', value: 60 }, { name: '11', value: 25 }, { name: '12', value: 40 }
];

const Dashboard = () => {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h2 className="dashboard-title">Dashboard</h2>
        
        {/* 상단 요약 카드 섹션 */}
        <div className="summary-cards">
          {/* Card 1: Total User */}
          <div className="card">
            <div className="card-top">
              <div className="card-info">
                <span className="card-label">Total User</span>
                <h3 className="card-number">40,689</h3>
              </div>
              <div className="card-icon" style={{ backgroundColor: '#EBEBFF', fill: '#8080FF' }}>
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
            </div>
            <div className="card-bottom">
              <span className="trend up">↗ 8.5%</span> <span className="trend-text">Up from yesterday</span>
            </div>
          </div>

          {/* Card 2: New User */}
          <div className="card">
            <div className="card-top">
              <div className="card-info">
                <span className="card-label">New User</span>
                <h3 className="card-number">10,293</h3>
              </div>
              <div className="card-icon" style={{ backgroundColor: '#FFF4E5', fill: '#FFB84D' }}>
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
            </div>
            <div className="card-bottom">
              <span className="trend up">↗ 1.3%</span> <span className="trend-text">Up from past week</span>
            </div>
          </div>

          {/* Card 3: Inactive User */}
          <div className="card">
            <div className="card-top">
              <div className="card-info">
                <span className="card-label">Inactive User</span>
                <h3 className="card-number">2,040</h3>
              </div>
              <div className="card-icon" style={{ backgroundColor: '#FFEBEB', fill: '#FF8080' }}>
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              </div>
            </div>
            <div className="card-bottom">
              <span className="trend up">↗ 1.8%</span> <span className="trend-text">Up from yesterday</span>
            </div>
          </div>
        </div>

        {/* 하단 차트 섹션 */}
        <div className="chart-section">
          <div className="chart-header">
            <h3>Account Details</h3>
            <select className="chart-filter">
              <option value="new">NEW</option>
              <option value="all">ALL</option>
            </select>
          </div>
          
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  {/* 차트 아래쪽 그라데이션 색상 정의 */}
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#aaa' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4A90E2" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 6, fill: "#4A90E2", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;