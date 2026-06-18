import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

const getInitialAuth = (): AuthState => {
  const defaultUser = {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    role: 'Administrator',
    permissions: ['admin', 'create', 'edit', 'delete']
  };
  const defaultToken = 'jwt_mock_token_alerts_iq';

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (token && userStr) {
      try {
        return {
          isAuthenticated: true,
          user: JSON.parse(userStr),
          token,
        };
      } catch {
        // Fallback to default
      }
    } else {
      // Auto-set the mock credentials in localStorage so they persist across reloads
      localStorage.setItem('auth_token', defaultToken);
      localStorage.setItem('auth_user', JSON.stringify(defaultUser));
    }
  }
  return {
    isAuthenticated: true,
    user: defaultUser,
    token: defaultToken,
  };
};

const initialState: AuthState = getInitialAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', action.payload.token);
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
