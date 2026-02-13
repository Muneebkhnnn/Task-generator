import ApiError from '../utils/apiError.js'

export const errorHandler = (err, req, res, next) => {
  let error = err

  if (!(error instanceof ApiError)) {
    let statusCode = 500
    let message = "Something went wrong"

    // PostgreSQL native errors (pg package)
    if (error.code) {
      // Handle specific PostgreSQL error codes
      switch (error.code) {
        case '23505': // unique_violation
          statusCode = 409
          message = "Duplicate entry — value must be unique."
          break
        case '23503': // foreign_key_violation
          statusCode = 400
          message = "Invalid reference — foreign key constraint failed."
          break
        case '23502': // not_null_violation
          statusCode = 400
          message = "Missing required field."
          break
        default:
          statusCode = 400
          message = error.message || "Database error."
      }
    } else if (error.statusCode) {
      statusCode = error.statusCode
      message = error.message
    }

    error = new ApiError(statusCode, message, error.errors || [], err.stack)
  }

  const response = {
    message: error.message,
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
  }

  return res.status(error.statusCode).json(response)
}
