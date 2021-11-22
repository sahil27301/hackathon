const QuestionController = require("../controllers/Question");
const Question = require("../models/Question");
const User = require("../models/User");

class CommentController {
  static async getEditComment(req, res) {
    try {
      const question = await QuestionController.fetchQuestionById(
        req.params.questionId
      );
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

  static async edit(questionId, commentId, body) {
    await Question.findOneAndUpdate(
      { _id: questionId, "replies._id": commentId },
      {
        $set: {
          "replies.$.body": body,
        },
      }
    );
  }

  static async updateComment(req, res) {
    try {
      const question = await QuestionController.fetchQuestionById(
        req.params.questionId
      );
      if (!question) {
        res.render("errors/404");
      }
      const replies = question.replies;
      const comment = replies.find(
        (reply) => reply._id == req.params.commentId
      );
      if (!comment) {
        res.render("errors/404");
      }
      if (comment.user != req.user.id && !req.user.isAdmin) {
        res.redirect(`/questions/${req.params.questionId}`);
      } else {
        await CommentController.edit(
          req.params.questionId,
          req.params.commentId,
          req.body.body
        );
        res.redirect(`/questions/${req.params.questionId}`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async delete(questionId, commentId) {
    await Question.findOneAndUpdate(
      { _id: questionId },
      {
        $pull: {
          replies: {
            _id: commentId,
          },
        },
      }
    );
  }

  static async deleteComment(req, res) {
    try {
      await CommentController.delete(
        req.params.questionId,
        req.params.commentId
      );
      res.redirect(`/questions/${req.params.questionId}`);
    } catch (err) {
      console.log(err);
    }
  }

  static async upload(question, reply) {
    question.replies.push(reply);
    await question.save();
  }

  static async addComment(req, res) {
    try {
      const question = await Question.findById(req.params.questionId);
      if (!question) {
        return res.redirect("errors/404");
      }
      let reply = {
        user: req.user._id,
        body: req.body.body,
      };
      await CommentController.upload(question, reply);
      res.redirect("/questions/" + req.params.questionId);
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = CommentController;
