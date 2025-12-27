export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    error: {
      location: err.location,
      data: err.data,
    },
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
