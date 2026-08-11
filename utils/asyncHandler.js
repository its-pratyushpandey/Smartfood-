/**
 * Wraps an async route/controller function so that any rejected
 * promise (thrown error) is forwarded to Express' error middleware,
 * removing the need for repetitive try/catch blocks.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
