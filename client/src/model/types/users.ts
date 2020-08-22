export const GET_USERS_DATA = 'GET_USERS_DATA';

export type UsersResponse = {
  users: Array<{
    user_id: string;
    name: string;
    email: string;
  }>;
};

type UserData = {
  uid: string;
  name: string;
  email: string;
  picture?: string;
  token: string;
};

export type UsersState = {
  loginStatus: string;
  authUserData: UserData;
  registerStatus: string;
  passwordResetStatus: string;
  googleRegisterStatus?: string;
  registerFailure?: string;
  isUsersDataLoading: boolean;
  userData: Array<[]>;
};
