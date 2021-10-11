const express = require('express');
const slotsController = require('../controllers/slotsController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(slotsController.getSlots)
  .post(slotsController.createSlot);

router
  .route('/available')
  .get(slotsController.getAvailableSlots);

router
  .route('/:slotId')
  .get(authController.protect, authController.restrictTo('admin', 'leader'), slotsController.getSlot)
  .delete(authController.protect, authController.restrictTo('admin'), slotsController.removeSlot)

router
  .route('/:slotId/assigned')
  .post(authController.protect, authController.restrictTo('admin'), slotsController.assignQuestionAndLeaderToSlot)
  .delete(authController.protect, authController.restrictTo('admin'), slotsController.removeQuestionAndLeaderFromSlot);

module.exports = router;