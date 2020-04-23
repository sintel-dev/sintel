import axios from 'axios';
import * as useractions from './users';
import { configureStore } from '../store';

jest.mock('axios');
describe('Users actions', () => {
  const store = configureStore();
  it('Ty to login with wrong credentials', async () => {
    const wrongUserCredentials = {
      email: 'wrongUser@nodomain.com',
      password: 'wrongPassword',
    };

    axios.post.mockImplementationOnce(() => Promise.resolve({ data: wrongUserCredentials }));

    await store.dispatch(useractions.onUserLoginAction(wrongUserCredentials));
    expect(store.getState().users.loginStatus).toEqual('fail');
  });
  it('Authenticate the user', async () => {
    const userCredentials = {
      email: 'realUser@realmail.com',
      password: 'realpassword',
    };

    axios.post.mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          data: {
            name: 'realUser',
            email: 'realUser@realmail.com',
            token: 'validToken',
          },
        },
      }),
    );

    const promise = store.dispatch(useractions.onUserLoginAction(userCredentials));
    expect(store.getState().users.loginStatus).toEqual('loading');

    await promise;
    expect(store.getState().users.loginStatus).toEqual('authenticated');
    expect(store.getState().users.authUserData.email).toEqual('realUser@realmail.com');
    expect(store.getState().users.authUserData.token).toEqual('validToken');
    expect(store.getState().users.authUserData.name).toEqual('realUser');
  });

  it('Deauthenticate the user', async () => {
    await store.dispatch(useractions.onUserLogoutAction());
    expect(store.getState().users.loginStatus).toEqual('unauthenticated');
  });
});
