import {
  loginReducer,
  getLoginStart,
  getLoginFailure,
  getLoginSuccess
} from './login.slice';

describe('login reducer', () => {
  it('should handle initial state', () => {
    expect(loginReducer(undefined, { type: '' })).toMatchObject({
      entities: []
    });
  });

  it('should handle get login actions', () => {
    let state = loginReducer(undefined, getLoginStart());

    expect(state).toEqual({
      loaded: false,
      error: null,
      entities: []
    });

    state = loginReducer(state, getLoginSuccess([{ id: 1 }]));

    expect(state).toEqual({
      loaded: true,
      error: null,
      entities: [{ id: 1 }]
    });

    state = loginReducer(state, getLoginFailure('Uh oh'));

    expect(state).toEqual({
      loaded: true,
      error: 'Uh oh',
      entities: [{ id: 1 }]
    });
  });
});
