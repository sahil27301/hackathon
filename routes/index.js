const express = require("express");

const router = express.Router();

const { ensureAuth, ensureGuest } = require("../middleware/auth");

const Question = require("../models/Question");

// @desc    Login/Landing page
// @route   GET /
router.get("/", ensureGuest, (req, res) => {
  res.render("login");
});

// @desc    Dashboard
// @route   GET /dasboard
router.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user.id }).lean();
    res.render("dashboard", {
      name: req.user.firstName,
      questions: questions,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
