import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
  logout: async () => {},
  getRoleDefaultPath: () => '/',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch verified profile from Supabase Database (Server-side validation)
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.warn('Profile fetch warning:', error?.message);
        // Fallback default role for registered citizens without profile record yet
        setProfile(null);
        setRole('citizen');
        return 'citizen';
      }

      setProfile(data);
      setRole(data.role || 'citizen');
      return data.role || 'citizen';
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setRole('citizen');
      return 'citizen';
    }
  };

  useEffect(() => {
    // 1. Initial Session Restoration
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // 2. Realtime Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
    }
  };

  const getRoleDefaultPath = (userRole = role) => {
    switch (userRole) {
      case 'super_admin':
      case 'dept_admin':
        return '/admin-dashboard';
      case 'employee':
        return '/employee-dashboard';
      case 'commissioner':
        return '/admin-dashboard';
      case 'citizen':
      default:
        return '/user-dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        logout,
        getRoleDefaultPath,
        refreshProfile: () => user && fetchUserProfile(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
