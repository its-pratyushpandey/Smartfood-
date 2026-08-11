import ApiError from "../utils/apiError.js";

/**
 * Catches requests to unknown routes and forwards a consistent 404 error.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
