const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'vaibhav', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
