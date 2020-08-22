import createReducer from '../store/createReducer';
import { UsersState } from '../types';

const initialState = {
  loginStatus: 'unauthenticated',
  authUserData: null,
  registerStatus: '',
  passwordResetStatus: '',
  isUsersDataLoading: true,
  usersData: [],
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

function GET_USERS_DATA_REQUEST(nextState: UsersState) {
  nextState.isUsersDataLoading = false;
}

function GET_USERS_DATA_SUCCESS(nextState, action) {
  nextState.isUsersDataLoading = false;
  nextState.usersData = action.result.users;
}

function GET_USERS_DATA_FAILURE(nextState: UsersState) {
  nextState.isUsersDataLoading = false;
  nextState.userData = [];
}

export default createReducer(initialState, {
  AUTHORIZED_USER_DATA,
  SET_LOGIN_STATUS,
  USER_REGISTER,
  GOOGLE_USER_REGISTER,
  RESET_PASSWORD_STATUS,
  GET_USERS_DATA_REQUEST,
  GET_USERS_DATA_SUCCESS,
  GET_USERS_DATA_FAILURE,
});
