import { ErrorClass } from "../utils/errorClass.util.js";

export const asyncHandler = (API) => {
  return (req, res, next) => {
    Promise.resolve(API(req, res, next)).catch((err) => {
      if (err instanceof ErrorClass) {
        return next(err);
      }

      next(
        new ErrorClass(
          "Internal Server Error",
          500,
          err.message,
          API.name || "unknown"
        )
      );
    });
  };
};
