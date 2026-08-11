import ApiError from "../utils/apiError.js";

/**
 * Centralized error handling middleware. Normalizes Mongoose errors
 * (validation, cast, duplicate key) and ApiError instances into a
 * consistent JSON error response shape.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Mongoose validation error
    if (err.name === "ValidationError") {
      const details = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = new ApiError(400, "Validation failed", details);
    } else if (err.name === "CastError") {
      error = new ApiError(400, `Invalid value for field "${err.path}": ${err.value}`);
    } else if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "field";
      error = new ApiError(409, `A record with this ${field} already exists`);
    } else {
      error = new ApiError(err.statusCode || 500, err.message || "Internal server error");
    }
  }

  if (process.env.NODE_ENV !== "production" && !error.isOperational) {
    console.error(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
    details: error.details || undefined,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
