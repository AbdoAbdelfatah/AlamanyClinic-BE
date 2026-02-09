import { ErrorClass } from "../utils/errorClass.util.js";

export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status ?? 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(". ");
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
  } else if (err instanceof ErrorClass) {
    statusCode = err.status;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...((err.location != null || err.data != null) && {
      error: { location: err.location, data: err.data },
    }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
