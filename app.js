const express = require("express");
// const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middlewares/error.handler");

const { authenticateToken } = require("./middlewares/jwt.middleware");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);

app.use(authenticateToken);

// app.use("/users", userRoutes);

app.use(errorHandler);

module.exports = app;
