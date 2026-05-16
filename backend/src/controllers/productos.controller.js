const productosService = require('../services/productos.service');
const { makeCrudController } = require('./crud.controller');

const base = makeCrudController(productosService);

module.exports = { ...base };
