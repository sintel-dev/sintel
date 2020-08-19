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
};
