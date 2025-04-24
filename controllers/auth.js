const models = require("../models");
const bcrypt = require("bcrypt");
const fs = require("fs");
const passport = require("passport");

let display = false;

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {
    path: "/register",
    title: "Register",
    show: display,
    errorMessage: req.flash("error"),
  });
};

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    title: "Login",
    show: display,
    errorMessage: req.flash("error"),
  });
};

exports.getResetPassword = (req, res, next) => {
  res.render("auth/resetPassword", {
    path: "/resetPassword",
    title: "Reset Password",
    show: display,
    errorMessage: req.flash("error"),
  });
};

exports.postLogout = (req, res, next) => {
  display = false;
  req.logout(() => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  });
};

exports.postResetPassword = (req, res, next) => {
  const { email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  models.User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Email does not exist!");
        return res.redirect("/resetPassword");
      }
      return models.User.update({ password: hash }, { where: { email } });
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((error) => {
      console.error(error);
      req.flash("error", "Something went wrong.");
      res.redirect("/resetPassword");
    });
};

exports.postRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);

  models.User.findOne({ where: { email } })
    .then((user) => {
      if (user) {
        req.flash("error", "Email already exists!");
        return res.redirect("/register");
      }

      return models.User.create({ name, email, password: hash });
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.error(err);
      req.flash("error", "Failed to register.");
      res.redirect("/register");
    });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  models.User.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password!");
        return res.redirect("/login");
      }

      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          req.flash("error", "Invalid email or password!");
          return res.redirect("/login");
        }

        req.session.user = user;
        display = true;

        if (user.name === "Admin") {
          return res.redirect("/admin");
        }
        res.redirect("/shop");
      });
    })
    .catch((err) => {
      console.error(err);
      req.flash("error", "Login failed.");
      res.redirect("/login");
    });
};
