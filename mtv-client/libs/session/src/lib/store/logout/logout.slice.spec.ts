import {
  logoutReducer,
  getLogoutStart,
  getLogoutFailure,
  getLogoutSuccess
} from './logout.slice';

describe('logout reducer', () => {
  it('should handle initial state', () => {
    expect(logoutReducer(undefined, { type: '' })).toMatchObject({
      entities: []
    });
  });

  it('should handle get logout actions', () => {
    let state = logoutReducer(undefined, getLogoutStart());

    expect(state).toEqual({
      loaded: false,
      error: null,
      entities: []
    });

    state = logoutReducer(state, getLogoutSuccess([{ id: 1 }]));

    expect(state).toEqual({
      loaded: true,
      error: null,
      entities: [{ id: 1 }]
    });

    state = logoutReducer(state, getLogoutFailure('Uh oh'));

    expect(state).toEqual({
      loaded: true,
      error: 'Uh oh',
      entities: [{ id: 1 }]
    });
  });
});
