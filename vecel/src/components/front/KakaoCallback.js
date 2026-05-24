import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = ({ setIsLoggedIn, setUserInfo, setIsAdmin }) => {
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
          
          let checkAdmin = false;

          if (serverData.accessToken) {
            try {
              const base64Url = serverData.accessToken.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));

              const tokenData = JSON.parse(jsonPayload);
              console.log("=== 토큰 내부 디코딩 데이터 ===");
              console.log(tokenData);

              checkAdmin = tokenData.role === 'ADMIN' || tokenData.auth === 'ADMIN' || tokenData.isAdmin === true;
            } catch (e) {
              console.error("토큰 디코딩 실패:", e);
            }
          }

          const userInfo = {
            userId: serverData.userId || null,
            name: serverData.name || "사용자",
            email: serverData.email || "",
            profileImage: "https://via.placeholder.com/150",
            isAdmin: checkAdmin
          };

          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('isAdmin', checkAdmin ? 'true' : 'false');
          sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          
          if (serverData.accessToken) {
            sessionStorage.setItem('accessToken', serverData.accessToken);
          }
          if (serverData.refreshToken) {
            sessionStorage.setItem('refreshToken', serverData.refreshToken);
          }

          setUserInfo(userInfo);
          setIsLoggedIn(true);
          if (setIsAdmin) setIsAdmin(checkAdmin);

          if (checkAdmin) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        })
        .catch(error => {
          console.error('카카오 로그인 에러:', error);
          alert('로그인에 실패했습니다.');
          navigate('/'); 
        });
    }
  }, [setIsLoggedIn, setUserInfo, setIsAdmin, navigate]);

  return null;
};

export default KakaoCallback;
