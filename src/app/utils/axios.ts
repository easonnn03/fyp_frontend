import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL:
    'https://apbook-sv-e4eah7gsdda6a7cf.southeastasia-01.azurewebsites.net',
});

api.interceptors.request.use(async (config) => {
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (accessToken) {
    try {
      const { exp } = jwtDecode<{ exp: number }>(accessToken);
      const now = Date.now() / 1000;

      if (exp < now && refreshToken) {
        const res = await axios.post(
          'https://apbook-sv-e4eah7gsdda6a7cf.southeastasia-01.azurewebsites.net/auth/refresh',
          {
            refresh_token: refreshToken,
          }
        );

        accessToken = res.data.access_token;
        localStorage.setItem('accessToken', accessToken!);
      }

      config.headers.Authorization = `Bearer ${accessToken}`;
    } catch (err) {
      toast.error('Session expired. Please log in again.');
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(err);
    }
  }

  return config;
});

export default api;

//Future Enhancements: save refresh token in cookies (httpOnly)
