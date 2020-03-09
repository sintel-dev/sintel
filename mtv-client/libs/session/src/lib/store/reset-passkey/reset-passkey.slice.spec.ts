import {
  resetPasskeyReducer,
  getResetPasskeyStart,
  getResetPasskeyFailure,
  getResetPasskeySuccess
} from './reset-passkey.slice';

describe('resetPasskey reducer', () => {
  it('should handle initial state', () => {
    expect(resetPasskeyReducer(undefined, { type: '' })).toMatchObject({
      entities: []
    });
  });

  it('should handle get resetPasskey actions', () => {
    let state = resetPasskeyReducer(undefined, getResetPasskeyStart());

    expect(state).toEqual({
      loaded: false,
      error: null,
      entities: []
    });

    state = resetPasskeyReducer(state, getResetPasskeySuccess([{ id: 1 }]));

    expect(state).toEqual({
      loaded: true,
      error: null,
      entities: [{ id: 1 }]
    });

    state = resetPasskeyReducer(state, getResetPasskeyFailure('Uh oh'));

    expect(state).toEqual({
      loaded: true,
      error: 'Uh oh',
      entities: [{ id: 1 }]
    });
  });
});
