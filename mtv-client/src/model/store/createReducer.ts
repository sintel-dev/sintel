import produce from 'immer';

function DEFAULT(state) {
  return state;
}

export default function createReducer(initialState = {}, reducers) {
  return function(state = initialState, action) {
    const { type } = action;

    if (!type) {
      console.warn('Action without type', action);
      return DEFAULT(state);
    }

    const reducer = reducers[type];

    if (!reducer) {
      return DEFAULT(state);
    }

    if (typeof reducer !== 'function') {
      console.warn(`Reducer for ${type} is not a function`);
      return DEFAULT(state);
    }

    return produce(state, nextState => reducer(nextState, action, state));
  };
}
