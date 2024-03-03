// // const products = [];
// // const fs = require("fs");
// // const path = require("path");
// const Cart = require("./cart");
// const db = require("../util/database");

// // const p = path.join(
// //   path.dirname(process.mainModule.filename),
// //   "data",
// //   "products.json"
// // );

// // const getProductsFromFile = (cb) => {
// //   fs.readFile(p, (err, fileContent) => {
// //     if (err || fileContent.byteLength === 0) return cb([]);
// //     cb(JSON.parse(fileContent));
// //   });
// // };

// module.exports = class Product {
//   constructor(id, title, imageUrl, description, price) {
//     this.id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }

//   save() {
//     // console.log(this);
//     // products.push(this); // this refers to the object created based on this class currently
//     // file - based databse code :
//     // getProductsFromFile((products) => {
//     //   if (this.id) {
//     //     const existingProductIndex = products.findIndex(
//     //       (prod) => prod.id === this.id
//     //     );
//     //     products[existingProductIndex] = this;
//     //     fs.writeFile(p, JSON.stringify(products), (err) => {
//     //       console.log(err);
//     //     });
//     //   } else {
//     //     this.id = Math.random().toString();
//     //     products.push(this); // this yaha pr class ke current object ko refer krega coz we are using arrow function isme this refers to it's parent
//     //     fs.writeFile(p, JSON.stringify(products), (err) => {
//     //       console.log(err);
//     //     });
//     //   }
//     // });

//     // mysql - based code:
//     // (?, ?, ?, ?) are addered here for safety from sql injection attack
//     return db.execute(
//       "INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)",
//       [this.title, this.price, this.imageUrl, this.description]
//     );
//   }

//   static deleteById(id) {
//     // file - based databse code :
//     // getProductsFromFile((products) => {
//     //   const productPrice = products.find((p) => p.id === id).price;
//     //   const updatedProducts = products.filter((p) => p.id !== id);
//     //   fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//     //     if (!err) {
//     //       Cart.deleteProduct(id, productPrice);
//     //     }
//     //   });
//     // });
//     // mysql - based code:
//   }

//   static fetchAll() {
//     // by static keyword we can call this function directly by class itself without creating object
//     // file - based databse code :
//     // getProductsFromFile(cb);
//     // return products;

//     // mysql - based code:
//     return db.execute("SELECT * FROM products");
//   }

//   static findById(id) {
//     // file - based databse code :
//     // getProductsFromFile((products) => {
//     //   const product = products.find((p) => p.id === id);
//     //   cb(product);
//     // });

//     // mysql - based code:
//     return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
//   }
// };


const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;
