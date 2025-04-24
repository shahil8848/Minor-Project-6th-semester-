const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models"); // Assuming Sequelize User model is in models folder

// Serialize user to store user ID in session
passport.serializeUser((user, done) => {
  done(null, user.id); // Save user ID to session
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id); // Find user by ID from DB
    done(null, user); // Return user object to session
  } catch (err) {
    done(err, null); // In case of error, return null
  }
});

// Google OAuth strategy setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Your Google client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google client secret
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Callback URL after successful authentication
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in the database by email
        const existingUser = await User.findOne({
          where: { email: profile.emails[0].value }, // Looking for matching email
        });

        if (existingUser) {
          // If the user exists, log them in
          return done(null, existingUser);
        }

        // If user doesn't exist, create a new user
        const newUser = await User.create({
          name: profile.displayName, // User's full name
          email: profile.emails[0].value, // User's email
          password: "", // Password is empty since it's Google OAuth (optional or can be generated)
        });

        // Return the new user to complete the OAuth process
        return done(null, newUser);
      } catch (err) {
        console.error("Error during Google OAuth:", err); // Log the error
        return done(err, null); // Return error if any
      }
    }
  )
);

module.exports = passport; // Export passport for use in your main app
