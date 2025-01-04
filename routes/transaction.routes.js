const express = require("express");
const {
  getTransactions,
  createTransfer,
  getBalance,
  getRecentTransactions,
  createTransaction,
  getTotalTransaction,
  getFamilyTransactions,
} = require("../controllers/transaction.controller");

const router = express.Router();

router.get("/history/family", getFamilyTransactions);
router.get("/history", getTransactions);
router.get("/recent", getRecentTransactions);
router.post("/transfer", createTransfer);
router.get("/total", getTotalTransaction);
router.get("/", getBalance);
router.post("/", createTransaction);

module.exports = router;
