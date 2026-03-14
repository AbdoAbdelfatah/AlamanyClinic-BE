export class ErrorClass extends Error {
  constructor(message, status = 500, data = null, location = null) {
    super(message);
    message = message + "An unexpected error occurred";
    this.status = status;
    this.statusCode = status; // ← add this line
    this.data = data;
    this.location = location;
    console.log(`❌ Error in ${location}:`, { message, status, data });
    Error.captureStackTrace(this, this.constructor);
  }
}
