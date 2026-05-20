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
        .then(resBody => {
          const serverData = resBody.data ? resBody.data : resBody;

          const userInfo = {
            name: serverData.name && serverData.name !== "." ? serverData.name : "사용자",
            email: serverData.email || "",
            profileImage: "https://via.placeholder.com/150" 
          };

          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          
          if (serverData.accessToken) {
            sessionStorage.setItem('accessToken', serverData.accessToken);
          }
          if (serverData.refreshToken) {
            sessionStorage.setItem('refreshToken', serverData.refreshToken);
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