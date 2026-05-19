const BASE_URL = 'http://3.34.115.198:8080'; 

export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = sessionStorage.getItem('accessToken');

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  let response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = sessionStorage.getItem('refreshToken');

    if (!refreshToken) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      sessionStorage.clear();
      window.location.href = '/'; 
      return response;
    }

    try {
      const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/token-refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken }) 
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        
        sessionStorage.setItem('accessToken', refreshData.accessToken);

        if (refreshData.refreshToken) {
          sessionStorage.setItem('refreshToken', refreshData.refreshToken);
        }

        headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
        response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

      } else {
        throw new Error("Refresh Token 만료");
      }
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      alert("다시 로그인해주세요.");
      sessionStorage.clear();
      window.location.href = '/';
    }
  }
  return response;
};