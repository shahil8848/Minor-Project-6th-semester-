const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const flash = require("connect-flash");
const passport = require("passport");
require("dotenv").config(); // Load .env file

require("./auth/password"); // Google OAuth strategy config

const app = express();

// Sequelize initialization
const { sequelize } = require("./models");

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/public/assets", express.static("./public/assets"));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));

// MySQL Session store
const dbOptions = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "shahil8848",
  database: "shopping",
  createDatabaseTable: true,
  schema: {
    tableName: "sessions_table",
    columnNames: {
      session_id: "custom_session_id",
      expires: "custom_expires_column_name",
      data: "custom_data_column_name",
    },
  },
};
const sessionStore = new MySQLStore(dbOptions);

// Sessions
app.use(
  session({
    secret: "my_secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages
app.use(flash());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Locals
app.use((req, res, next) => {
  res.locals.user = req.user || req.session.user || null;
  res.locals.errorMessage = req.flash("error");
  next();
});

// Routes
const productRoute = require("./routes/productRoute");
const authRoute = require("./routes/authRoute");
const adminRoute = require("./routes/adminRoute");

app.use(authRoute);
app.use(productRoute);
app.use("/admin", adminRoute);

// Sync DB & Start Server
sequelize
  .sync({ alter: true }) // Updates tables if needed
  .then(() => {
    console.log("✅ Database synced successfully");
    app.listen(5000, () => {
      console.log("✅ Server is running at http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error("❌ Unable to sync database:", err);
  });
