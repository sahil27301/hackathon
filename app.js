const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const methodOverride = require("method-override");

// Load config
dotenv.config({ path: "./config/config.env" });

// passport config
require("./config/passport")(passport);

connectDB();

const app = express();

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Date formatting
var moment = require("moment");
app.locals.moment = require("moment");

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// method-override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/questions", require("./routes/questions"));

app.listen(process.env.PORT || 3000, function () {
  console.log(
    `Server started with mode ${process.env.NODE_ENV} on port ${process.env.PORT}`
  );
});
