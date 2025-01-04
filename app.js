const express = require("express");
// const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const familyRoutes = require("./routes/family.routes");
const transactionRoutes = require("./routes/transaction.routes");
const errorHandler = require("./middlewares/error.handler");
const { authenticateToken } = require("./middlewares/jwt.middleware");
const notFoundMiddleware = require("./middlewares/notfound.middleware");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

app.use(authenticateToken);

app.use("/family", familyRoutes);
app.use("/transaction", transactionRoutes);

app.use(notFoundMiddleware);
app.use(errorHandler);

module.exports = app;
