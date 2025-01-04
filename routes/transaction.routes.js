const express = require("express");
const {
  getTransactions,
  createTransfer,
  getBalance,
  getRecentTransactions,
  createTransaction,
  getTotalTransaction,
} = require("../controllers/transaction.controller");

const router = express.Router();

router.get("/history", getTransactions);
router.get("/recent", getRecentTransactions);
router.post("/transfer", createTransfer);
router.get("/total", getTotalTransaction);
router.get("/", getBalance);
router.post("/", createTransaction);

module.exports = router;
