const express = require("express");
const router = express.Router();
const {
  createFamily,
  joinFamily,
  getFamilyMembers,
} = require("../controllers/family.controller");

router.post("/join", joinFamily);
router.get("/members", getFamilyMembers);
router.post("/", createFamily);

module.exports = router;
