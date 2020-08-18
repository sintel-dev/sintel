export const GET_USERS_DATA = 'GET_USERS_DATA';

export type UsersResponse = {
  users: Array<{
    user_id: string;
    name: string;
    email: string;
  }>;
};
