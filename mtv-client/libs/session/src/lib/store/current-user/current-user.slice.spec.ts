import {
  currentUserReducer,
  getCurrentUserStart,
  getCurrentUserFailure,
  getCurrentUserSuccess
} from './current-user.slice';

describe('currentUser reducer', () => {
  it('should handle initial state', () => {
    expect(currentUserReducer(undefined, { type: '' })).toMatchObject({
      entities: []
    });
  });

  it('should handle get currentUser actions', () => {
    let state = currentUserReducer(undefined, getCurrentUserStart());

    expect(state).toEqual({
      loaded: false,
      error: null,
      entities: []
    });

    state = currentUserReducer(state, getCurrentUserSuccess([{ id: 1 }]));

    expect(state).toEqual({
      loaded: true,
      error: null,
      entities: [{ id: 1 }]
    });

    state = currentUserReducer(state, getCurrentUserFailure('Uh oh'));

    expect(state).toEqual({
      loaded: true,
      error: 'Uh oh',
      entities: [{ id: 1 }]
    });
  });
});
