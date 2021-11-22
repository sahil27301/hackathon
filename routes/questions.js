const express = require("express");

const router = express.Router();

const { ensureAuth } = require("../middleware/auth");

const Question = require("../models/Question");
const User = require("../models/User");

const UserController = require("../controllers/UserController");

const {
  editIcon,
  editCommentIcon,
  stripTags,
  truncate,
} = require("../controllers/Utils");

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
      editIcon: editIcon,
      editCommentIcon: editCommentIcon,
    });
  } catch (err) {
    console.log(err);
  }
});

// @desc    Show edit page
// @route   GET /questions/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
    }).lean();
    if (!question) {
      res.render("errors/404");
    }
    if (question.user != req.user.id && !req.user.isAdmin) {
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

// @desc    Edit comment
// @route   GET /questions/edit/:id/comment/:commentId
router.get(
  "/edit/:questionId/comment/:commentId",
  ensureAuth,
  async (req, res) => {
    try {
      const question = await Question.findOne({
        _id: req.params.questionId,
      }).lean();
      if (!question) {
        res.render("errors/404");
        return;
      }
      const replies = question.replies;
      const comment = replies.find(
        (reply) => reply._id == req.params.commentId
      );
      if (!comment) {
        res.render("errors/404");
      }
      if (comment.user != req.user.id && !req.user.isAdmin) {
        // console.log(question.user, req.user.id);
        res.redirect("/questions");
      } else {
        res.render("questions/editComment", {
          question: question,
          comment: comment,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
);

// @desc    Update question
// @route   PUT /questions/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById(req.params.id).lean();

    if (!question) {
      res.render("errors/404");
    }
    if (question.user != req.user.id && !req.user.isAdmin) {
      res.redirect("/questions");
    } else {
      if (!req.body.mode) {
        req.body.mode = "normal";
      }
      await Question.findOneAndUpdate(
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

// @desc    Update comment
// @route   PUT /questions/:questionId/comment/:commentId
router.put("/:questionId/comment/:commentId", ensureAuth, async (req, res) => {
  try {
    let question = await Question.findById(req.params.questionId).lean();
    if (!question) {
      res.render("errors/404");
    }
    const replies = question.replies;
    const comment = replies.find((reply) => reply._id == req.params.commentId);
    if (!comment) {
      res.render("errors/404");
    }
    if (comment.user != req.user.id && !req.user.isAdmin) {
      res.redirect(`/questions/${req.params.questionId}`);
    } else {
      // console.log(req.body.body)
      await Question.findOneAndUpdate(
        { _id: req.params.questionId, "replies._id": req.params.commentId },
        {
          $set: {
            "replies.$.body": req.body.body,
          },
        }
      );
      res.redirect(`/questions/${req.params.questionId}`);
    }
  } catch (err) {
    console.log(err);
  }
});

// @desc    Delete question
// @route   DELETE /question/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Question.findOneAndDelete({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

// @desc    Delete comment
// @route   DELETE /question/:questionId/comment/:commentId
router.delete(
  "/:questionId/comment/:commentId",
  ensureAuth,
  async (req, res) => {
    try {
      await Question.findOneAndUpdate(
        { _id: req.params.questionId },
        {
          $pull: {
            replies: {
              _id: req.params.commentId,
            },
          },
        }
      );
      res.redirect(`/questions/${req.params.questionId}`);
    } catch (err) {
      console.log(err);
    }
  }
);

// @desc    User Questions
// @route   GET /questions/user/:userId
router.get("/user/:userId", ensureAuth, UserController.get);

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
