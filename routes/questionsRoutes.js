const express = require('express');
const questionController = require('../controllers/questionController');
const authController = require('../controllers/authController');

// ROUTES

const router = express.Router();

  router
    .route('/')
    .post(authController.protect, authController.restrictTo('admin'), questionController.createNewParentQuestion);

  router
    .route('/reset')
    .delete(authController.protect, authController.restrictTo('admin'), questionController.reset);

  router
    .route('/parent/:parentId/child/:childId')
    .put(authController.protect, authController.restrictTo('admin'), questionController.addChildToParentQuestion);

  router
    .route('/scheduled')
    .get(authController.protect, questionController.getScheduledQuestions);
  
  router
    .route('/available')
    .get(authController.protect, authController.restrictTo('admin', 'leader'), questionController.getAvailableQuestions);
    
  router
    .route('/rejected')
    .get(authController.protect, authController.restrictTo('admin'), questionController.getRejectedQuestions);
    
  router
    .route('/unapproved')
    .get(authController.protect, authController.restrictTo('admin'), questionController.getUnapprovedQuestions)
    .post(questionController.createUnapprovedQuestion);
    
  router
    .route('/answered')
    .get(authController.protect, questionController.getAnsweredQuestions);
    
  router
    .route('/rejected/:questionId')
    .put(authController.protect, authController.restrictTo('admin'), questionController.rejectQuestion);

  router
    .route('/:questionId/topics/:topicId')
    .put(authController.protect, authController.restrictTo('admin'), questionController.assignTopicsToQuestion);
    

module.exports = router;
