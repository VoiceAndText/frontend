import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = ({ setIsLoggedIn, setUserInfo }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    
    if (code) {
      // 💡 실제로는 여기서 백엔드 API를 호출하여 정보를 가져옴
      // fetch(`https://api.yourserver.com/login?code=${code}`)
      //   .then(res => res.json())
      //   .then(data => {
      
      // 테스트용 가짜 데이터
      const dummyUserInfo = {
        nickname: "홍길동",
        email: "koko@kakao.com",
        profileImage: "https://via.placeholder.com/150" // 실제 연동 시 카카오 URL로 대체됨
      };

      // 로컬 스토리지에 저장 (새로고침 대비)
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userInfo', JSON.stringify(dummyUserInfo));

      setUserInfo(dummyUserInfo);
      setIsLoggedIn(true);
      navigate('/', { replace: true });
      
      //   });
    }
  }, [setIsLoggedIn, setUserInfo, navigate]);

  return null;
};

export default KakaoCallback;