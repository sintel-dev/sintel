import {
  registerReducer,
  getRegisterStart,
  getRegisterFailure,
  getRegisterSuccess
} from './register.slice';

describe('register reducer', () => {
  it('should handle initial state', () => {
    expect(registerReducer(undefined, { type: '' })).toMatchObject({
      entities: []
    });
  });

  it('should handle get register actions', () => {
    let state = registerReducer(undefined, getRegisterStart());

    expect(state).toEqual({
      loaded: false,
      error: null,
      entities: []
    });

    state = registerReducer(state, getRegisterSuccess([{ id: 1 }]));

    expect(state).toEqual({
      loaded: true,
      error: null,
      entities: [{ id: 1 }]
    });

    state = registerReducer(state, getRegisterFailure('Uh oh'));

    expect(state).toEqual({
      loaded: true,
      error: 'Uh oh',
      entities: [{ id: 1 }]
    });
  });
});
