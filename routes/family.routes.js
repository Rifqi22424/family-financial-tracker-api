const express = require("express");
const router = express.Router();
const {
  createFamily,
  joinFamily,
  getFamilyMembers,
  updateMemberPermissions,
  getFamilyCode,
} = require("../controllers/family.controller");

router.post("/grant", updateMemberPermissions);
router.post("/join", joinFamily);
router.get("/members", getFamilyMembers);
router.get("/", getFamilyCode);
router.post("/", createFamily);

module.exports = router;
