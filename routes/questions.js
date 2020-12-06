const express = require("express");

const router = express.Router();

const { ensureAuth } = require("../middleware/auth");

const Question = require("../models/Question");

// @desc    Show add page
// @route   GET /questions/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("questions/add");
});

editIcon = function (questionUser, loggedUser, questionId, floating = true) {
  if (questionUser._id.toString() == loggedUser._id.toString()) {
    if (floating) {
      return `<a href="/questions/edit/${questionId}" class="btn-floating halfway-fab blue"><i class="fas fa-edit fa-small"></i></a>`;
      // return `<a href="google.com">lol</a>`;
    } else {
      return `<a href="/questions/edit/${questionId}"><i class="fas fa-edit"></i></a>`;
    }
  } else {
    return "";
  }
};

stripTags = function (input) {
  return input.replace(/<(?:.|\n)*?>/gm, "");
};

truncate = function (str, len) {
  if (str.length > len && str.length > 0) {
    let new_str = str + " ";
    new_str = str.substr(0, len);
    new_str = str.substr(0, new_str.lastIndexOf(" "));
    new_str = new_str.length > 0 ? new_str : str.substr(0, len);
    return new_str + "...";
  }
  return str;
};

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

// @desc    Show all questions
// @route   GET /questions
router.get("/", ensureAuth, async (req, res) => {
  try {
    const questions = await Question.find({})
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("questions/index", {
      questions: questions,
      truncate: truncate,
      stripTags: stripTags,
      editIcon: editIcon,
      currentUser: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
  }).lean();
  if (!question) {
    res.render("errors/404");
  }
});

module.exports = router;
