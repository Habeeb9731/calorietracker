import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, calorieGoal) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, calorieGoal: Number(calorieGoal) || 2000 } },
    });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Check your email to confirm your account, then log in.');
    const { data: profile } = await api.get('/auth/me');
    setUser(profile.user);
    return profile.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateGoal = async (calorieGoal) => {
    const { data } = await api.patch('/auth/update-goal', { calorieGoal });
    setUser((prev) => ({ ...prev, calorieGoal: data.calorieGoal }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateGoal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
