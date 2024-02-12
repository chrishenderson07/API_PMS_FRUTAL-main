const Sequelize = require('sequelize');
const dbConfig = require('../config/database');
const connection = new Sequelize(dbConfig);

const Perfil = require('../models/Perfil');
const Usuario = require('../models/Usuario');
const Pms = require('../models/Pms')

Perfil.init(connection);
Usuario.init(connection);
Pms.init(connection);

module.exports = connection;