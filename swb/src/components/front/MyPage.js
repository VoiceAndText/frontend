import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/MyPage.css';
import ProfileIcon from '../images/user.png';

const MyPage = ({ userInfo, setIsLoggedIn }) => {
    const navigate = useNavigate();

    if (!userInfo) return <div className="loading">사용자 정보를 불러오는 중입니다...</div>;

    const handleImgError = (e) => {
        e.target.src = ProfileIcon; 
    };

    const handleWithdrawal = () => {
        const isConfirmed = window.confirm("정말로 탈퇴하시겠습니까? 모든 정보가 삭제됩니다.");

        if (isConfirmed) {
        // 실제 가입이 아니므로 카카오 API 호출 대신 로컬 데이터만 삭제
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userInfo');
        
        setIsLoggedIn(false);
        alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
        navigate('/');
        }
    };

    return (
        <div className="mypage-wrapper">
            <div className="mypage-container">
                <div className="profile-image-section">
                    <img 
                        src={userInfo.profileImage} 
                        alt="Profile" 
                        className="profile-display-img" 
                        onError={handleImgError}
                    />
                </div>

                <div className="profile-info-section">
                    <div className="info-row">
                        <span className="info-label">Nickname : </span>
                        <span className="info-value">{userInfo.nickname}</span>
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