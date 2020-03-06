import API from './api';
import axios, { AxiosError } from 'axios';

// jest.mock('axios');

describe('User auth unit test', () => {
  it('signup succeed', async () => {
    const responseSignup = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'users/signup/',
      method: 'post',
      data: {
        email: 'ucenter.mtv@gmail.com',
        name: 'testuser',
      },
    });

    console.log(responseSignup.data);
    expect(responseSignup.data.message).toMatch('password has been sent');
  }, 10000);

  it('signup failed due to dumplicated email', async () => {
    try {
      await axios({
        baseURL: 'http://127.0.0.1:3000/api/v1/',
        url: 'users/signup/',
        method: 'post',
        data: {
          email: 'ucenter.mtv@gmail.com',
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
      url: 'users/signin/',
      method: 'post',
      data: {
        email: 'ucenter.mtv@gmail.com',
        password: '6BNPSFU7',
      },
    });

    console.log(responseSignin.data);
    expect(responseSignin.data).toHaveProperty('data.token');
  });

  it('signin failed', async () => {
    let status: number;
    try {
      const responseSignin = await axios({
        baseURL: 'http://127.0.0.1:3000/api/v1/',
        url: 'users/signin/',
        method: 'post',
        data: {
          email: 'ucenter.mtv@gmail.com',
          password: 'WRONGPASSWORD',
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
      url: 'users/signin/',
      method: 'post',
      data: {
        email: 'ucenter.mtv@gmail.com',
        password: '6BNPSFU7',
      },
    });

    const { uid, token } = responseSignin.data.data;

    let status: number;
    try {
      const responseSignin = await axios({
        baseURL: 'http://127.0.0.1:3000/api/v1/',
        url: 'users/signout/',
        method: 'get',
        params: {
          uid,
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

  it('reset password succeed', async () => {
    const responseSignin = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'users/signin/',
      method: 'post',
      data: {
        email: 'ucenter.mtv@gmail.com',
        password: '6BNPSFU7',
      },
    });

    const { uid, token } = responseSignin.data.data;

    let status: number;
    try {
      const responseSignin = await axios({
        baseURL: 'http://127.0.0.1:3000/api/v1/',
        url: 'users/reset/',
        method: 'post',
        data: {
          email: 'ucenter.mtv@gmail.com',
        },
        params: {
          uid,
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
  }, 10000);
});

describe('User auth integration test', () => {
  it('signin and fetch authorized resource', async () => {
    const responseSignin = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'users/signin/',
      method: 'post',
      data: {
        email: 'ucenter.mtv@gmail.com',
        password: '6BNPSFU7',
      },
    });

    let { uid, token } = responseSignin.data.data;

    // IMPORTANT STEP TO authorize RESTAPIs
    API.authorize(uid, token);

    // If authorized, should return auth pass message
    const getTestData = await API.test.all();
    console.log(getTestData);
    expect(getTestData.message).toMatch('auth pass');
  });
});
