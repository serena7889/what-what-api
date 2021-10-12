const express = require('express');
const settingsController = require('../controllers/settingsController');
const authController = require('../controllers/authController');

// ROUTES

const router = express.Router();

  router
    .route('/askQuestionPassphrase/:phrase')
    .get(settingsController.checkAskQuestionPassphrase)
    .put(authController.protect, authController.restrictTo('admin'), settingsController.updateAskQuestionPassphrase);

module.exports = router;
