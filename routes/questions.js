const express = require("express");

const router = express.Router();

const { ensureAuth } = require("../middleware/auth");

const Question = require("../models/Question");
const User = require("../models/User");

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

// @desc    Show single question
// @route   GET /questions/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById(req.params.id)
      .populate("user")
      .lean();
    if (!question) {
      return res.render("errors/404");
    }

    // let replyAuthors = []
    // question.replies.forEach(function(reply) {
    //   let replyAuthor = await User.findById(reply.user);
    //   replyAuthors.push(replyAuthor.displayName)
    // })

    for (let index = 0; index < question.replies.length; index++) {
      user = await User.findById(question.replies[index].user);
      // console.log(user);
      question.replies[index].displayName = user.displayName;
    }
    // console.log(question.replies[0]);

    // console.log(question);
    res.render("questions/show", {
      question: question,
      currentUser: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
    }).lean();
    if (!question) {
      res.render("errors/404");
    }
    if (question.user != req.user.id) {
      // console.log(question.user, req.user.id);
      res.redirect("/questions");
    } else {
      res.render("questions/edit", {
        question: question,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// @desc    Update question
// @route   PUT /questions/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById(req.params.id).lean();

    if (!question) {
      res.render("errors/404");
    }
    if (question.user != req.user.id) {
      res.redirect("/questions");
    } else {
      if (!req.body.mode) {
        req.body.mode = "normal";
      }
      question = await Question.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.log(err);
  }
});

// @desc    Delete question
// @route   DELETE /story/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Question.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

// @desc    User Questions
// @route   GET /questions/user/:userId
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const questions = await Question.find({
      user: req.params.userId,
      mode: "normal",
    })
      .populate("user")
      .lean();
    res.render("questions/user", {
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

router.post("/:questionId", ensureAuth, async (req, res) => {
  try {
    question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.redirect("errors/404");
    }
    let reply = {
      user: req.user._id,
      body: req.body.body,
    };
    question.replies.push(reply);
    question.save();
    res.redirect("/questions/" + req.params.questionId);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
