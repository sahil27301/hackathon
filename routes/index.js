const express = require("express");

const router = express.Router();

const { ensureAuth, ensureGuest } = require("../middleware/auth");

const UserController = require("../controllers/User");

// @desc    Login/Landing page
// @route   GET /
router.get("/", ensureGuest, UserController.getLogin);

// @desc    Dashboard
// @route   GET /dasboard
router.get("/dashboard", ensureAuth, UserController.getDashboard);

module.exports = router;
