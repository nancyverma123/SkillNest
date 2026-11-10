import axios from 'axios';

// Generous timeout: the free-tier backend can take ~30-50s to wake up.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 60000 });

api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

// A 401 on an authenticated request means the session is no longer valid.
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const sentToken = Boolean(error.config?.headers?.Authorization);
    const isLogin = error.config?.url?.startsWith('/auth/login');
    if (error.response?.status === 401 && sentToken && !isLogin) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export const errMsg = (e) => {
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (e?.request && !e.response) return 'Unable to reach the server. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
};

export default api;
