import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);
  const auth = async (path, body) => {
    const { data } = await api.post(`/auth/${path}`, body);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login: (b) => auth('login', b), register: (b) => auth('register', b), logout }}>{children}</Ctx.Provider>;
}
