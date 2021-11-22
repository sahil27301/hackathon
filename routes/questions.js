const express = require("express");

const router = express.Router();

const { ensureAuth } = require("../middleware/auth");

const Question = require("../models/Question");

const UserController = require("../controllers/User");
const QuestionController = require("../controllers/Question");
const CommentController = require("../controllers/Comment");

// @desc    Show add page
// @route   GET /questions/add
router.get("/add", ensureAuth, QuestionController.addQuestion);

// @desc    Process the add form
// @route   POST /questions
router.post("/", ensureAuth, QuestionController.post);

// @desc    Show all questions
// @route   GET /questions
router.get("/", ensureAuth, QuestionController.getAllQuestions);

// @desc    Show single question
// @route   GET /questions/:id
router.get("/:id", ensureAuth, QuestionController.getSingleQuestion);

// @desc    Show edit page
// @route   GET /questions/edit/:id
router.get("/edit/:id", ensureAuth, QuestionController.editQuestion);

// @desc    Edit comment
// @route   GET /questions/edit/:id/comment/:commentId
router.get(
  "/edit/:questionId/comment/:commentId",
  ensureAuth,
  CommentController.getEditComment
);

// @desc    Update question
// @route   PUT /questions/:id
router.put("/:id", ensureAuth, QuestionController.updateQuestion);

// @desc    Update comment
// @route   PUT /questions/:questionId/comment/:commentId
router.put(
  "/:questionId/comment/:commentId",
  ensureAuth,
  CommentController.updateComment
);

// @desc    Delete question
// @route   DELETE /question/:id
router.delete("/:id", ensureAuth, QuestionController.deleteQuestion);

// @desc    Delete comment
// @route   DELETE /question/:questionId/comment/:commentId
router.delete(
  "/:questionId/comment/:commentId",
  ensureAuth,
  CommentController.deleteComment
);

// @desc    User Questions
// @route   GET /questions/user/:userId
router.get("/user/:userId", ensureAuth, UserController.get);

router.post("/:questionId", ensureAuth, CommentController.addComment);

module.exports = router;
