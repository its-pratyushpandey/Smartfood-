import ApiError from "../utils/apiError.js";

/**
 * Generic middleware factory that validates `req.body` against a Zod
 * schema. On failure it forwards a 400 ApiError with a field-level
 * breakdown of validation issues; on success it replaces `req.body`
 * with the parsed (and coerced/sanitized) data.
 */
const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
    }));

    return next(new ApiError(400, "Validation failed", details));
  }

  req.body = result.data;
  next();
};

export default validateRequest;
