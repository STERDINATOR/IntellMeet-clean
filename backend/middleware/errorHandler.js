// middleware/errorHandler.js - Example error handling middleware
// Implement your custom error handling logic here

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
