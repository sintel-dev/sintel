import API from './api';

import axios, { AxiosError } from 'axios';

// jest.mock('axios');

describe('User auth test', () => {
  it('test api with auth', async () => {
    const responseTest = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'test/',
      method: 'get',
      headers: {
        Authorization: 'AUTH_TOKEN',
      },
    });
    console.log(responseTest.data);
    expect(responseTest.data).toHaveProperty('message');
  });

  it('signup succeed', async () => {
    const responseSignup = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'auth/signup/',
      method: 'post',
      data: {
        email: 'ustdongyu@gmail.com',
        name: 'dyuliu',
      },
    });

    console.log(responseSignup.data);
    expect(responseSignup.data.message).toMatch('password has been sent');
  });

  it('signup failed due to dumplicated email', async () => {
    try {
      await axios({
        baseURL: 'http://127.0.0.1:3000/api/v1/',
        url: 'auth/signup/',
        method: 'post',
        data: {
          email: 'ustdongyu@gmail.com',
          name: 'dyuliu',
        },
      });
    } catch (e) {
      const _e = e as AxiosError;
      expect(_e.response.status).toBe(400);
    }
  });

  it('signin succeed', async () => {
    const responseSignin = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'auth/signin/',
      method: 'post',
      data: {
        email: 'ustdongyu@gmail.com',
        password: 'YAA663ZQ',
      },
    });

    // console.log(responseSignin.data);
    expect(responseSignin.data).toHaveProperty('data.token');
  });

  it('signin failed', async () => {
    let status: number;
    try {
      const responseSignin = await axios({
        baseURL: 'http://127.0.0.1:3000/api/v1/',
        url: 'auth/signin/',
        method: 'post',
        data: {
          email: 'ustdongyu@gmail.com',
          password: 'YAA663ZQ1',
        },
      });
    } catch (e) {
      const _e = e as AxiosError;
      status = _e.response.status;
    }

    expect(status).toBe(401);
  });

  it('signout succeed', async () => {
    const responseSignin = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'auth/signin/',
      method: 'post',
      data: {
        email: 'ustdongyu@gmail.com',
        password: 'YAA663ZQ',
      },
    });

    const { id, token } = responseSignin.data.data;

    let status: number;
    try {
      const responseSignin = await axios({
        baseURL: 'http://127.0.0.1:3000/api/v1/',
        url: 'auth/signout/',
        method: 'get',
        params: {
          id,
        },
        headers: {
          Authorization: token,
        },
      });
      status = responseSignin.status;
    } catch (e) {
      const _e = e as AxiosError;
      status = _e.response.status;
    }

    expect(status).toBe(204);
  });
});
