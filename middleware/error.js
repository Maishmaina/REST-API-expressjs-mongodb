const ErrorResponse = require("../util/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  // log to consolefordev
  console.log(err);

  //mongoose bad id[Object]
  if (err.name === "CastError") {
    const message = `Resource Not found!`;
    error = new ErrorResponse(message, 404);
  }
  //Mongoose duplicate Key
  if (err.code === 11000) {
    const message = "Duplicated field value Entered";
    error = new ErrorResponse(message, 400);
  }
  //Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};
module.exports = errorHandler;
