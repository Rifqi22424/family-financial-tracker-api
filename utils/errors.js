class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "Bad Request Error";
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "Not Found Error";
    this.statusCode = 404;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.name = "Internal Server Error";
    this.statusCode = 500;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "Unauthorized Error";
    this.statusCode = 401;
  }
}

module.exports = {
  BadRequestError,
  NotFoundError,
  InternalServerError,
  UnauthorizedError,
};
