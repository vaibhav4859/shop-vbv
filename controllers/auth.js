const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/user");
const { validationResult } = require('express-validator');

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email.toLowerCase() })
    .then((user) => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password.',
          oldInput: {
            email: email,
            password: password
          },
          validationErrors: []
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid email or password.',
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: []
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  // User.findById("65df8347bf7b56a49aa1f54e")
  //   .then((user) => {
  //     console.log("user");
  //     req.session.isLoggedIn = true;
  //     req.session.user = user;
  //     req.session.save((err) => {
  //       // mongodb takes few miliseconds to save data within it so in some cases we can redirect too quickly before data is even written here for example session is created so in that cases we can use this save method then once data is stored successfully then redirect only
  //       console.log(err);
  //       res.redirect("/");
  //     });
  //   })
  //   .catch((err) => console.log(err));
  // req.session.isLoggedIn = true; // ye method better isliye h coz session ek encrypted value as a cookie store krta h in browser of client which is checked only by server using a sercet value mentioned by us and usko user smjh nhi skta so vo usko edit kr dega if in case to it is gonna be verified at our server
  //   res.setHeader("Set-Cookie", "loggedIn=true"); // one way to set cokkie but isko user browser mei edit kr skta h
  // req.user work kr rha h cz in app.js vo haar incoming req pr middleware run krega then call next() toh fir uska registred route controller call hoga so re.user haar baar set ho jaega for every incoming request
  //   req.isLoggedIn = true; // this won't work coz ek baar response send kra user ko then nayi req ke liye ye isloggedin in stick nhi rhega uss nayi req par basically aise re object pr set krkr nhi rhega so we have to use cookies to store user is lofgged in or not
  // toh agar mai req.isLoggedIn = true; vo req.user waale middleare mei app.js mei daal du aur ye isAuthenticated: req.isLoggedIn, haar get request mei daal du then ye work krega approach but ye koi better approach nhi so we use cookies
};

exports.postSignup = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(async (result) => {
      const response = await axios({
        method: "post",
        url: "https://api.sendinblue.com/v3/smtp/email",
        headers: {
          "api-key": process.env.API_KEY,
          "content-type": "application/json",
        },
        data: {
          sender: {
            name: "Shop-vbv",
            email: "vsachdeva4859@gmail.com",
          },
          to: [
            {
              email: result.email,
              name: "vbv",
            },
          ],
          subject: "Account Creation Successfull",
          htmlContent: `<h1>You successfully signed up at shop-vbv!</h1>`,
          replyTo: {
            email: "vsachdeva4859@gmail.com",
            name: "Shop-vbv",
          },
        },
      });

      console.log("Email sent successfully:", response.data);
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = async (req, res, next) => {
  try {
    // remove session from database
    await req.session.destroy();
    // remove the session cookie from browser
    await res.clearCookie("connect.sid");

    res.redirect("/login");
  } catch (err) {
    console.log("Error posting logout:", err);
  }
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email.toLowerCase() })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(async (result) => {
        res.redirect("/");
        const response = await axios({
          method: "post",
          url: "https://api.sendinblue.com/v3/smtp/email",
          headers: {
            "api-key": process.env.API_KEY,
            "content-type": "application/json",
          },
          data: {
            sender: {
              name: "Shop-vbv",
              email: "vsachdeva4859@gmail.com",
            },
            to: [
              {
                email: req.body.email,
                name: "vbv",
              },
            ],
            subject: "Password reset",
            htmlContent: `
            <p>You requested a password reset</p>
            <p>Click this <a href="https://shop-vbv.onrender.com/reset/${token}">link</a> to set a new password.</p>
          `,
            replyTo: {
              email: "vsachdeva4859@gmail.com",
              name: "Shop-vbv",
            },
          },
        });

        console.log("Email sent successfully:", response.data);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
