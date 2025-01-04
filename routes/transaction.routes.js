const express = require("express");
const {
  getMonthlyTransactions,
  createTransfer,
  getBalance,
  getRecentTransactions,
  createTransaction,
} = require("../controllers/transaction.controller");

const router = express.Router();

router.get("/monthly", getMonthlyTransactions);
router.get("/history", getRecentTransactions);
router.post("/transfer", createTransfer);
router.get("/", getBalance);
router.post("/", createTransaction);

module.exports = router;
