import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    
    if (code) {
      setIsLoggedIn(true);
      navigate('/', { replace: true });
    }
  }, [setIsLoggedIn, navigate]);

  return null;
};

export default KakaoCallback;