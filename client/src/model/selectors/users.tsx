import { RootState } from '../types';

export const getLoginStatus = (state) => state.users.loginStatus;
export const authUserData = (state: RootState) => state.users.authUserData;
export const registerStatus = (state) => state.users.registerStatus;
export const googleRegisterStatus = (state) => state.users.googleRegisterStatus;
export const getPasswordResetStatus = (state) => state.users.passwordResetStatus;
