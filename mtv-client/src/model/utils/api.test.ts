import API from './api';

import axios from 'axios';

// jest.mock('axios');

describe('Should fetch data from server', () => {
  // it('UserTest', async () => {
  //   const responseTest = await axios({
  //     baseURL: 'http://127.0.0.1:3000/api/v1/',
  //     url: 'test/',
  //     method: 'get',
  //     headers: {
  //       Authorization: 'AUTH_TOKEN',
  //     },
  //   });
  //   console.log(responseTest.data);
  //   expect(responseTest.data).toHaveProperty('message');
  // });

  // it('UserSignup succeed', async () => {
  //   const responseSignup = await axios({
  //     baseURL: 'http://127.0.0.1:3000/api/v1/',
  //     url: 'auth/signup/',
  //     method: 'post',
  //     data: {
  //       email: 'ustdongyu@gmail.com',
  //       name: 'dyuliu',
  //     },
  //   });

  //   console.log(responseSignup.data);
  //   expect(responseSignup.data.message).toMatch('password has been sent');
  // });

  // it('UserSignup failed due to dumplicated email', async () => {
  //   try {
  //     await axios({
  //       baseURL: 'http://127.0.0.1:3000/api/v1/',
  //       url: 'auth/signup/',
  //       method: 'post',
  //       data: {
  //         email: 'ustdongyu@gmail.com',
  //         name: 'dyuliu',
  //       },
  //     });
  //   } catch (e) {
  //     expect(String(e)).toMatch('status code 400');
  //   }
  // });

  it('UserSignin succeed', async () => {
    const responseSignin = await axios({
      baseURL: 'http://127.0.0.1:3000/api/v1/',
      url: 'auth/signin/',
      method: 'post',
      data: {
        email: 'ustdongyu@gmail.com',
        password: 'YAA663ZQ',
      },
    });

    console.log(responseSignin.data);
    expect(responseSignin.data.message).toHaveProperty('token');
  });

  // it('Events', async () => {
  //   // create
  //   const creatingEvent = {
  //     datarun_id: '5da7cc6576e3e19307d0db65',
  //     start_time: 1228219200,
  //     stop_time: 1229299200,
  //     score: 1.1,
  //     tag: 'problem',
  //   };
  //   let event = await API.events.create(creatingEvent);
  //   expect(event.score).toBe(1.1);

  //   // get event by event ID
  //   event = await API.events.find(event.id);
  //   expect(event.score).toBe(1.1);

  //   // update
  //   const updatingEvent = {
  //     start_time: 1228219201,
  //     stop_time: 1229299201,
  //     score: 1.99,
  //     tag: 'normal',
  //   };
  //   event = await API.events.update(event.id, updatingEvent);
  //   expect(event.score).toBe(1.99);

  //   // get events by datarun ID
  //   let res = await API.events.all({}, { datarun_id: '5da7cc6576e3e19307d0db65' });
  //   expect(res.events).toBeInstanceOf(Array);

  //   // delete
  //   let res2 = await API.events.delete(event.id);
  //   expect(res2).toBe(200);
  // });
});
