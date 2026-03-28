const express = require("express");
const router = express.Router();

const { getPacks, createPack } = require("../controllers/packController");

router.get("/", getPacks);      // must not be undefined
router.post("/", createPack);

module.exports = router;