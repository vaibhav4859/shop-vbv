const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const mongoConnect = require('./util/database').mongoConnect;
const errorController = require("./controllers/error");
const User = require('./models/user');


app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById('65dbb6987acf197ec6e32eb9')
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

// app.use(errorController.get404Page);


mongoConnect(() => {
  app.listen(3000);
});