const express = require("express");

const router = express.Router();

const { ensureAuth } = require("../middleware/auth");

const Question = require("../models/Question");

// @desc    Show add page
// @route   GET /questions/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("questions/add");
});

// @desc    Process the add form
// @route   POST /questions
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Question.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
