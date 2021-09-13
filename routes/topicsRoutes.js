const express = require('express');
const topicsController = require('../controllers/topicsController');
const authController = require('../controllers/authController');

// ROUTES

const router = express.Router();

router
  .route('/')
  .get(topicsController.getTopics)
  .post(topicsController.createTopic);

module.exports = router;