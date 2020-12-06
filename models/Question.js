const mongoose = require("mongoose");

const ReplySchema = {
  user: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "User",
  },
  body: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectID,
    ref: "User",
  },
  mode: {
    type: String,
    default: "normal",
    enum: ["normal", "anonymous"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: {
    type: [ReplySchema],
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
