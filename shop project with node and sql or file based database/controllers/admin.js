const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // const product = new Product(null, title, imageUrl, description, price);
  // file - based databse code :
  // product.save();

  // mysql - based code:
  // product
  //   .save()
  //   .then(() => res.redirect("/"))
  //   .catch((err) => console.log(err));

  // sequelize based code:
  req.user
    .createProduct({
      // this createProduct is offered by sequelizze bcz i created relation in app.js file that user can have many products
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
      userId: req.user.id,
    })
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const { edit } = req.query;
  if (!edit) return res.redirect("/");
  const { productId } = req.params;
  // Product.findById(productId, (product) => {
  //   if (!product) return res.redirect("/");
  //   res.render("admin/edit-product", {
  //     pageTitle: "Edit Product",
  //     path: "/admin/edit-product",
  //     editing: edit,
  //     product: product,
  //   });
  // });

  // sequelize code
  // Product.findAll({ where: { id: productId } })
  // Product.findById(prodId)
  req.user
    .getProducts({ where: { id: productId } })
    .then((products) => {
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: edit,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, imageUrl, description } = req.body;
  // const updatedProduct = new Product(
  //   productId,
  //   title,
  //   imageUrl,
  //   description,
  //   price
  // );
  // updatedProduct.save();
  // res.redirect("/admin/products");

  // sequelize code:
  Product.findByPk(prodId)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  // Product.fetchAll((products) => {
  //   res.render("admin/products", {
  //     prods: products,
  //     pageTitle: "Admin Products",
  //     path: "/admin/products",
  //   });
  // });

  // sequelize code:
  // Product.findAll()
  req.user.getProducts()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  // Product.deleteById(productId);
  // res.redirect("/admin/products");
  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
