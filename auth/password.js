const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models"); 

passport.serializeUser((user, done) => {
  done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id); 
    done(null, user); 
  } catch (err) {
    done(err, null); 
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          where: { email: profile.emails[0].value }, 
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await User.create({
          name: profile.displayName, 
          email: profile.emails[0].value,
          password: "", 
        });

        return done(null, newUser);
      } catch (err) {
        console.error("Error during Google OAuth:", err); 
        return done(err, null); 
      }
    }
  )
);

module.exports = passport; 
