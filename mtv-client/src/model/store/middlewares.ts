export const api = () => (next) => async (action) => {
  const { type, promise, ...rest } = action;
  if (!promise || !type) {
    next(action);
    return;
  }

  next({ type: `${type}_REQUEST`, promise, ...rest });

  try {
    const result = await promise;
    next({ type: `${type}_SUCCESS`, promise, ...rest, result });
  } catch (error) {
    console.error(error);
    next({ type: `${type}_FAILURE`, promise, ...rest, error: error.message });
  }
};
