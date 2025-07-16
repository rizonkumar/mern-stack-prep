const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    message = `Duplicate entry: ${err.errors.map((e) => e.message).join(", ")}`;
  } else if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = `Validation error: ${err.errors
      .map((e) => e.message)
      .join(", ")}`;
  } else if (
    err.name === "SequelizeDatabaseError" &&
    err.parent &&
    err.parent.code === "22P02"
  ) {
    statusCode = 400;
    message = "Invalid data format provided.";
  } else if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Foreign key constraint failed. Related record does not exist.";
  }

  if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
};

module.exports = { notFound, errorHandler };
