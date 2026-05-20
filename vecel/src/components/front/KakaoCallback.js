import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = ({ setIsLoggedIn, setUserInfo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    
    if (code) {
      fetch('https://voiceandtext.duckdns.org/api/v1/auth/kakao-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code 
        }),
      })
        .then(res => {
          if (!res.ok) throw new Error('서버 응답 오류');
          return res.json();
        })
        .then(data => {
          const userInfo = {
            name: data.name || "사용자",
            email: data.email || "",
            // 프로필 이미지는 스웨거 응답 예시에 없으므로 기본 이미지 처리
            profileImage: "https://via.placeholder.com/150" 
          };

          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          
          if (data.accessToken) {
            sessionStorage.setItem('accessToken', data.accessToken);
          }
          if (data.refreshToken) {
            sessionStorage.setItem('refreshToken', data.refreshToken);
          }

          setUserInfo(userInfo);
          setIsLoggedIn(true);
          navigate('/', { replace: true });
        })
        .catch(error => {
          console.error('카카오 로그인 에러:', error);
          alert('로그인에 실패했습니다.');
          navigate('/'); 
        });
    }
  }, [setIsLoggedIn, setUserInfo, navigate]);

  return null;
};

export default KakaoCallback;