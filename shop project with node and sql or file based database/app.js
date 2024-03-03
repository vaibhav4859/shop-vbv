const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
// const expressHbs = require('express-handlebars');
const app = express();
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const sequelize = require("./util/database");
const errorController = require("./controllers/error");

// app.engine('handlebars', expressHbs({ layoutsDir: 'views/layouts', defaultLayout: 'main-layout' }))

// app.set(name, value) Assigns setting name to value. You may store any value that you want, but certain names can be used to configure the behavior of the server like below.
// pug then finally compiles written code into that in normal html it is used to render dynamic html
// app.set('view engine', 'handlebars');
app.set("view engine", "ejs");
app.set("views", "views"); // second views is to specify folder name that is same as default in my case views containg html files but if it was of diff name then i would have to specify here

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user; // this user here is a sequilize object not just a javascript object so it will properties of sequelize also like destroy
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404Page);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" }); // CASCADE means if user is deleted all products created by user should also be deleted
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem }); // trhough means telling sequelize where to store this model
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem })

// npm start runs this sequelize code and app.use middlewares are only registered on npm start they run when there is an incoming request
sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
    // console.log(result);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Max", email: "test@test.com" });
    }
    return user;
  })
  .then((user) => {
    // console.log(user);
    return user.getCart().then((cart) => {
      console.log('LETs CHECK CART BEFORE CREATING: ' + cart);
      if (!cart) {
        console.log('USER AVAILABLE INSIDE a PROMISE: ' + user.id);
        return user.createCart();
      }
      return cart;
    });
    // return user.createCart();
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });

// sequelize - ss6
