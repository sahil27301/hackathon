const User = require("../models/User");
const Question = require("../models/Question");

class UserController {
  static async CreateUser(profile, done) {
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      image: profile.photos[0].value,
    };
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        done(null, user);
      } else {
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async fetchPosts(userId) {
    return await Question.find({
      user: userId,
      mode: "normal",
    })
      .populate("user")
      .lean();
  }

  static async get(req, res) {
    try {
      const questions = await UserController.fetchPosts(req.params.userId);
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
  }
}

module.exports = UserController;
