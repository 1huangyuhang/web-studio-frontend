import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userInfo: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: UserState = {
  userInfo: null,
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{
        userInfo: UserState['userInfo'];
        token: string;
      }>
    ) => {
      state.userInfo = action.payload.userInfo;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
    },
    updateUserInfo: (state, action: PayloadAction<UserState['userInfo']>) => {
      state.userInfo = action.payload;
    },
  },
});

export const { loginSuccess, logout, updateUserInfo } = userSlice.actions;

export default userSlice.reducer;
