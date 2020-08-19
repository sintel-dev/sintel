import createReducer from '../store/createReducer';
import { UsersState } from '../types';

const initialState: UsersState = {
  loginStatus: 'unauthenticated',
  authUserData: null,
  registerStatus: '',
  passwordResetStatus: '',
};

function AUTHORIZED_USER_DATA(nextState: UsersState, { authUserData }) {
  nextState.authUserData = authUserData;
}

function SET_LOGIN_STATUS(nextState: UsersState, { loginStatus }) {
  nextState.loginStatus = loginStatus;
}

function USER_REGISTER(nextState: UsersState, { registerStatus, failureReason }) {
  nextState.registerStatus = registerStatus;
  nextState.registerFailure = failureReason;
}

function GOOGLE_USER_REGISTER(nextState: UsersState, { googleRegisterStatus }) {
  nextState.googleRegisterStatus = googleRegisterStatus;
}

function RESET_PASSWORD_STATUS(nextState, { passwordResetStatus }) {
  nextState.passwordResetStatus = passwordResetStatus;
}

export default createReducer<UsersState>(initialState, {
  AUTHORIZED_USER_DATA,
  SET_LOGIN_STATUS,
  USER_REGISTER,
  GOOGLE_USER_REGISTER,
  RESET_PASSWORD_STATUS,
});
