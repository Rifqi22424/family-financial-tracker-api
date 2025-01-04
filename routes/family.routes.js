const express = require("express");
const router = express.Router();
const {
  createFamily,
  joinFamily,
} = require("../controllers/family.controller");

router.post("/", createFamily);
router.post("/join", joinFamily);

module.exports = router;
