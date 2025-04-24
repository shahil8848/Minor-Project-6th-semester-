const express = require("express");
const passport = require("passport");
const authControllers = require("../controllers/auth");

const route = express.Router();

// Custom Auth
route.get("/register", authControllers.getRegister);
route.get("/login", authControllers.getLogin);
route.get("/resetPassword", authControllers.getResetPassword);

route.post("/resetPassword", authControllers.postResetPassword);
route.post("/register", authControllers.postRegister);
route.post("/login", authControllers.postLogin);
route.get("/logout", authControllers.postLogout);

// Google OAuth Routes
route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/shop"); // Redirect after successful login
  }
);

module.exports = route;
