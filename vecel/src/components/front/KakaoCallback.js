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
          // [체크] 서버가 보내주는 실제 유저 정보 데이터 구조를 브라우저 콘솔에 출력합니다.
          console.log("=== 백엔드 서버 로그인 응답 데이터 전체 ===");
          console.log(resBody);

          const serverData = resBody.data ? resBody.data : resBody;
          
          // 콘솔창에 찍힌 내용을 보고 아래 매칭 기준을 서버 필드명에 맞게 수정해야 합니다.
          const checkAdmin = serverData.role === 'ADMIN' || serverData.isAdmin === true;

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
