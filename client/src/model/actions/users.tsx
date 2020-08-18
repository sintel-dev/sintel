import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL, SESSION_TOKEN, AUTHENTICATED_USER_ID } from '../utils/constants';
import { GET_USERS_DATA } from '../types/users';
import API from '../utils/api';

export function registerUserAction(userData) {
  return async function (dispatch) {
    dispatch({ type: 'USER_REGISTER', registerStatus: 'loading', failureReason: null });
    await axios
      .post(`${API_URL}users/signup/`, userData)
      .then(() => {
        dispatch({ type: 'USER_REGISTER', registerStatus: 'success', failureReason: null });
      })
      .catch((err) => dispatch({ type: 'USER_REGISTER', registerStatus: 'fail', failureReason: err }));
  };
}

export function googleRegisterAction(userData) {
  return async function (dispatch) {
    await axios.post(`${API_URL}auth/google_login/`, userData).then((response) => {
      dispatch({ type: 'GOOGLE_USER_REGISTER', googleRegisterStatus: 'success' });
      Cookies.set(SESSION_TOKEN, response.data.data.token);
    });
  };
}

export function onUserResetPassKey(userEmail) {
  return async function (dispatch) {
    dispatch({ type: 'RESET_PASSWORD_STATUS', passwordResetStatus: 'loading' });
    await axios
      .post(`${API_URL}users/reset/`, userEmail)
      .then(() => {
        dispatch({ type: 'RESET_PASSWORD_STATUS', passwordResetStatus: 'success' });
      })
      .catch(() => dispatch({ type: 'RESET_PASSWORD_STATUS', passwordResetStatus: 'fail' }));
  };
}

export function onUserLoginAction(userData) {
  return async function (dispatch) {
    dispatch({ type: 'SET_LOGIN_STATUS', loginStatus: 'loading' });
    await axios
      .post(`${API_URL}users/signin/`, userData)
      .then((response) => {
        const { data } = response.data;
        const { token } = data;
        dispatch({ type: 'AUTHORIZED_USER_DATA', authUserData: data });

        Cookies.set(SESSION_TOKEN, token, {
          expires: Date.now() + (userData.rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24),
        });
        dispatch({ type: 'SET_LOGIN_STATUS', loginStatus: 'authenticated' });
        return response;
      })
      .catch(() => {
        dispatch({ type: 'SET_LOGIN_STATUS', loginStatus: 'fail' });
      });
  };
}

export function getUserAuthStatusAction() {
  return function (dispatch) {
    const authHeader = Cookies.get(SESSION_TOKEN);
    const loginStatus = authHeader ? 'authenticated' : 'unauthenticated';

    dispatch({ type: 'SET_LOGIN_STATUS', loginStatus });
  };
}

export function onUserLogoutAction() {
  return function (dispatch) {
    const authHeader = Cookies.get(SESSION_TOKEN);
    if (!authHeader) {
      return dispatch({ type: 'SET_LOGIN_STATUS', loginStatus: 'unauthenticated' });
    }

    axios.get(`${API_URL}users/signout/`, { headers: { [SESSION_TOKEN]: authHeader } });
    Cookies.remove(SESSION_TOKEN);
    Cookies.remove(AUTHENTICATED_USER_ID);
    return dispatch({ type: 'SET_LOGIN_STATUS', loginStatus: 'unauthenticated' });
  };
}

export function googleLoginAction(userData) {
  return async function (dispatch) {
    await axios.post(`${API_URL}auth/google_login/`, userData).then((response) => {
      const { data } = response.data;
      Cookies.set(SESSION_TOKEN, data.token);
      dispatch({ type: 'SET_LOGIN_STATUS', loginStatus: 'authenticated' });

      Cookies.set(AUTHENTICATED_USER_ID, data.uid);
    });
  };
}

export function getUsersDataAction() {
  return function (dispatch) {
    const action = {
      type: GET_USERS_DATA,
      promise: API.users.all(),
    };
    dispatch(action);
  };
}
