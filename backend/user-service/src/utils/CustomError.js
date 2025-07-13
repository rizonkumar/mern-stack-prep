class CustomError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent Error constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // E.g., 4xx is 'fail', 5xx is 'error'
    this.isOperational = true; // Mark as an operational error (expected error), not a programming error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
