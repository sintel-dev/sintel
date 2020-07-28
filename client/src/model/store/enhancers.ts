const round = (number) => Math.round(number * 100) / 100;

export const monitorReducerEnhancer = (createStore) => (reducer, initialState, enhancer) => {
    const monitoredReducer = (state, action) => {
        const start = performance.now();
        const newState = reducer(state, action);
        const end = performance.now();
        round(end - start);
        // console.log('reducer process time:', round(end - start));
        return newState;
    };
    return createStore(monitoredReducer, initialState, enhancer);
};
