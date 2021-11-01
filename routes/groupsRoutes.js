const express = require('express');
const groupsController = require('../controllers/groupsController');
const authController = require('../controllers/authController');

// ROUTES

const router = express.Router();

router
  .route('/')
  .get(groupsController.getGroups)
  .post(authController.protect, authController.restrictTo('admin'), groupsController.createGroup);

module.exports = router;