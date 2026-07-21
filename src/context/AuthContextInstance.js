import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  loading: true,
  logout: async () => {},
  getRoleDefaultPath: () => '/',
});
