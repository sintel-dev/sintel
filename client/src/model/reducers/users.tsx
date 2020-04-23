import createReducer from '../store/createReducer';

const initialState = {
  loginStatus: 'unauthenticated',
  authUserData: null,
  registerStatus: '',
  passwordResetStatus: '',
};

function AUTHORIZED_USER_DATA(nextState, { authUserData }) {
  nextState.authUserData = authUserData;
}

function SET_LOGIN_STATUS(nextState, { loginStatus }) {
  nextState.loginStatus = loginStatus;
}

function USER_REGISTER(nextState, { registerStatus, failureReason }) {
  nextState.registerStatus = registerStatus;
  nextState.registerFailure = failureReason;
}

function GOOGLE_USER_REGISTER(nextState, { googleRegisterStatus }) {
  nextState.googleRegisterStatus = googleRegisterStatus;
}

function RESET_PASSWORD_STATUS(nextState, { passwordResetStatus }) {
  nextState.passwordResetStatus = passwordResetStatus;
}

export default createReducer(initialState, {
  AUTHORIZED_USER_DATA,
  SET_LOGIN_STATUS,
  USER_REGISTER,
  GOOGLE_USER_REGISTER,
  RESET_PASSWORD_STATUS,
});
