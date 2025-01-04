const { NotFoundError } = require("../utils/errors");

// middlewares/notFound.middleware.js
const notFoundMiddleware = (req, res, next) => {
    throw new NotFoundError("Halaman tidak ditemukan");
  };
  
  module.exports = notFoundMiddleware;
  