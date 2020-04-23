import produce, { Draft } from 'immer';

function DEFAULT(state: any) {
  return state;
}

export interface PartialReducer<T> {
  (state: Draft<T> | T, action, state2?: T);
}

export default function createReducer<T>(initialState: T, reducers: { [type: string]: PartialReducer<T> }) {
  return function (state: T = initialState, action): T {
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

    // Create the next immutable state tree by simply modifying the current tree
    return produce(state, (nextState) => reducer(nextState, action, state)) as T;
  };
}
