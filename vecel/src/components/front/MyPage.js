import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MyPage.css';
import ProfileIcon from '../images/user.png';
import { fetchWithAuth } from './api';

const MyPage = ({ userInfo, setIsLoggedIn }) => {
    const navigate = useNavigate();

    if (!userInfo) return <div className="loading">사용자 정보를 불러오는 중입니다...</div>;

    const handleImgError = (e) => {
        e.target.src = ProfileIcon; 
    };

    const handleWithdrawal = async () => {
        const isConfirmed = window.confirm("정말로 탈퇴하시겠습니까? 모든 정보가 삭제되며 복구할 수 없습니다.");

        if (!isConfirmed) return; 

        try {
            const res = await fetchWithAuth('/api/v1/auth/withdraw', {
                method: 'DELETE',
            });

            if (res.ok) {
                sessionStorage.clear(); 
                
                setIsLoggedIn(false);
                alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
                navigate('/', { replace: true });
            } else {
                alert("회원 탈퇴 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            }
        } catch (error) {
            console.error("회원탈퇴 API 통신 에러:", error);
            alert("서버와의 연결이 원활하지 않습니다.");
        }
    };

    return (
        <div className="mypage-wrapper">
            <div className="mypage-container">
                <div className="profile-image-section">
                    <img 
                        src={userInfo.profileImage || ProfileIcon} 
                        alt="Profile" 
                        className="profile-display-img" 
                        onError={handleImgError}
                    />
                </div>

                <div className="profile-info-section">
                    <div className="info-row">
                        <span className="info-label">Name : </span>
                        <span className="info-value">{userInfo.name}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Email : </span>
                        <span className="info-value">{userInfo.email}</span>
                    </div>
                </div>

                <div className="withdrawal-section">
                    <button className="withdrawal-btn" onClick={handleWithdrawal}>회원 탈퇴하기</button>
                </div>
            </div>
        </div>
    );
};

export default MyPage;