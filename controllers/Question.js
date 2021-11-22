const Question = require("../models/Question");
const User = require("../models/User");

const { stripTags, truncate, editIcon } = require("../helpers/Utils");

class QuestionController {
  static async fetchQuestionById(id) {
    return await Question.findById(id).populate("user").lean();
  }

  static async getAllQuestions(req, res) {
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
  }

  static async upload(question) {
    await Question.create(question);
  }

  static async post(req, res) {
    try {
      req.body.user = req.user.id;
      QuestionController.upload(req.body);
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  static async addQuestion(_req, res) {
    res.render("questions/add");
  }

  static async getSingleQuestion(req, res) {
    try {
      let question = await QuestionController.fetchQuestionById(req.params.id);
      if (!question) {
        return res.render("errors/404");
      }
      for (let index = 0; index < question.replies.length; index++) {
        let user = await User.findById(question.replies[index].user);
        question.replies[index].displayName = user.displayName;
      }

      res.render("questions/show", {
        question: question,
        currentUser: req.user,
        editIcon: editIcon,
        editCommentIcon: editCommentIcon,
      });
    } catch (err) {
      console.log(err);
    }
  }

  static async editQuestion(req, res) {
    try {
      const question = await Question.findOne({
        _id: req.params.id,
      }).lean();
      if (!question) {
        res.render("errors/404");
      }
      if (question.user != req.user.id && !req.user.isAdmin) {
        res.redirect("/questions");
      } else {
        res.render("questions/edit", {
          question: question,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async edit(questionId, question) {
    await Question.findOneAndUpdate(
      {
        _id: questionId,
      },
      question,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  static async updateQuestion(req, res) {
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
        QuestionController.edit(req.params.id, req.body);
        res.redirect("/dashboard");
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async delete(id) {
    await Question.findOneAndDelete({ _id: id });
  }

  static async deleteQuestion(req, res) {
    try {
      QuestionController.delete(req.params.id);
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = QuestionController;
