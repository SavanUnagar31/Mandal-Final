const express = require('express');

const configureMiddleware = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

module.exports = { configureMiddleware };