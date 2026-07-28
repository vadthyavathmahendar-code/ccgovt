import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { AuthContext } from './AuthContextInstance';
import { logAuditEvent } from '../utils/auditLogger';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUserRef = React.useRef(null);
  const updateLoggedUser = (u) => {
    setUser(u);
    currentUserRef.current = u?.id || null;
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('fetchUserProfile error/no-data:', error, 'data:', data);
        setProfile(null);
        setRole('citizen');
        return 'citizen';
      }

      setProfile(data);
      setRole(data.role || 'citizen');
      return data.role || 'citizen';
    } catch (err) {
      console.error('Error fetching profile:', err);
      setRole('citizen');
      return 'citizen';
    }
  };

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      const timeout = new Promise((resolve) => setTimeout(resolve, 1500, 'timeout'));
      try {
        const result = await Promise.race([
          (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!active) return 'inactive';
            if (session?.user) {
              updateLoggedUser(session.user);
              await fetchUserProfile(session.user.id);
            } else {
              updateLoggedUser(null);
              setProfile(null);
              setRole(null);
            }
            return 'resolved';
          })(),
          timeout
        ]);
        if (result === 'timeout') {
          console.warn('Session recovery timed out after 1.5s. Bypassing lock.');
        }
      } catch (err) {
        console.error('Error during initAuth:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return;
        
        // Skip duplicate initial session trigger on mount
        if (event === 'INITIAL_SESSION') return;

        // Skip state changes and background database queries if user has not changed
        const newUserId = session?.user?.id || null;
        if (newUserId === currentUserRef.current) {
          return;
        }

        try {
          setLoading(true);
          if (session?.user) {
            updateLoggedUser(session.user);
            await fetchUserProfile(session.user.id);
          } else {
            updateLoggedUser(null);
            setProfile(null);
            setRole(null);
          }
        } catch (err) {
          console.error('Error in onAuthStateChange handler:', err);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const currentUserId = user?.id;
    const currentUserRole = role;

    // 1. Instantly clear local session states to trigger immediate UI redirect
    updateLoggedUser(null);
    setProfile(null);
    setRole(null);

    // 2. Perform background logging and signOut without blocking user redirection
    try {
      if (currentUserId) {
        logAuditEvent({
          userId: currentUserId,
          userRole: currentUserRole || 'citizen',
          action: 'auth_logout',
          entityType: 'auth',
          entityId: currentUserId,
          status: 'success'
        }).catch(err => console.error('Logout logging warning:', err));
      }
      supabase.auth.signOut().catch(err => console.error('Supabase signOut warning:', err));
    } catch (err) {
      console.error('Logout error handler:', err);
    }
  };

  const getRoleDefaultPath = (userRole = role) => {
    switch (userRole) {
      case 'super_admin':
      case 'dept_admin':
      case 'commissioner':
        return '/admin-dashboard';
      case 'employee':
        return '/employee-dashboard';
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
        refreshProfile: (forcedId) => {
          const idToFetch = forcedId || (user && user.id);
          if (idToFetch) return fetchUserProfile(idToFetch);
          return Promise.resolve(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
