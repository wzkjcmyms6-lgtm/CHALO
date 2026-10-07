import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.getSession().then(setUser).finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => setUser(await db.login(username, password));
  const logout = async () => {
    await db.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
