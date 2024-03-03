const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { csrfSync } = require("csrf-sync");
const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => req.body["CSRFToken"],
});
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
dotenv.config();

// we use this mongodb store to store our sessions because on production server if we deploy this memory will be required and consumed for thousands of users and also security wise also it is not ideal to store session in browser there so we store it in our mongo db databse
const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const errorController = require("./controllers/error");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")); // image is name we mention of input in our form and also wrote enctype="multipart/form-data" to accept binary dile like files also
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: "vbv",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfSynchronisedProtection);
app.use(flash());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn; // these locals allow us to set local variables that are passed into views for every request so isloggedin status and csrf is provided to every incoming request now
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next(); // if user is logged out then there is no session ans user id in it
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) return next();
      req.user = user; // we store our user in re.user bcz we want to use methods like add to cart and many more to be used associated with user model we created beacuse in session only plain user data is stored not functions associated to it
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then((result) => {
    app.listen(3000);
    console.log("Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

// sessions are stored on server side and cookies are stored in client side browser

// we will use csurf to protect website from csrf attack(see ss12 to understad this attack) .
// now by csurf from our frontend forms we send a token along with it and at server that token is checked if it is present and valid then only server side code is run and data is manipulated otherwise if third party website sends requests to our server a token will be missing there and they can't guess token to send wth request as our server will validate it so our website is protected then from csrf attacks
