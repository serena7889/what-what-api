const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(userController.getAllUsers)

router
  .route('/byToken')
  .get(authController.getUserFromToken);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.modifyUser)
  .delete(userController.deleteUser);

router.post('/leaders/signup', authController.leaderSignUp);
router.post('/students/signup', authController.studentSignUp);
router.post('/login', authController.logIn);

router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
// router.patch('/updateMe', authController.protect, userController.updateMe);

module.exports = router;
