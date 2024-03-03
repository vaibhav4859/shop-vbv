// const fs = require("fs");
// const path = require("path");

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   "data",
//   "cart.json"
// );

// module.exports = class Cart {
//   static addProduct(id, productPrice) {
//     // fetch the prev cart
//     fs.readFile(p, (err, fileContent) => {
//       let cart = { products: [], totalPrice: 0 };
//       if (!err) cart = JSON.parse(fileContent);
//       // find if it already exists in cart or not
//       const existingProductIndex = cart.products.findIndex(
//         (prod) => prod.id === id
//       );
//       let existingProduct = cart.products[existingProductIndex];
//       let updatedProduct;
//       if (existingProduct) {
//         updatedProduct = { ...existingProduct };
//         updatedProduct.qty = updatedProduct.qty + 1;
//         cart.products[existingProductIndex] = updatedProduct;
//       } else {
//         updatedProduct = { id: id, qty: 1 };
//         cart.products.push(updatedProduct);
//       }
//       cart.totalPrice = cart.totalPrice + +productPrice; // string to number
//       fs.writeFile(p, JSON.stringify(cart), (err) => {
//         console.log(err);
//       });
//     });
//   }

//   static deleteProduct(id, productPrice) {
//     fs.readFile(p, (err, fileContent) => {
//       if (err) return;
//       const updatedCart = { ...JSON.parse(fileContent) };

//       const productQty = updatedCart.products.find((p) => p.id === id)?.qty;
//       if (!productQty) return;
//       updatedCart.totalPrice -= productPrice * productQty;
//       updatedCart.products = updatedCart.products.filter((p) => p.id !== id);
//       fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
//         console.log(err);
//       });
//     });
//   }

//   static getCart(cb) {
//     fs.readFile(p, (err, fileContent) => {
//       const cart = JSON.parse(fileContent);
//       if (err) return null;
//       else cb(cart);
//     });
//   }
// };

const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Cart = sequelize.define("cart", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Cart;
