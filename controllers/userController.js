// const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const AuthController = require('./authController');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  })
  return newObj;
}

// ROUTE HANDLERS

exports.getAllUsers = catchAsync(async (req, res, next) => {

  // Execute query
    const features = await new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  // Return response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  })

})

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(404, `No user with id: ${req.params.id}`));
  }

  console.log(user);

  res.status(200).json({
    status: 'success',
    data: user,
  })
})

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).send({
    status: 'success',
    data: {
      user: newUser,
    }
  })
})

exports.modifyUser = catchAsync(async (req, res, next) => {
  const modifiedUser = await User.findByIdAndUpdate(req.params.id, req.body);

  if (!modifiedUser) {
    return next(new AppError(404, `No user with id: ${req.params.id}`));
  }

  res.status(201).send({
    status: 'success',
    data: {
      user: modifiedUser,
    }
  })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(404, `No user with id: ${req.params.id}`));
  }

  res.status(204).send({
    status: 'success',
    data: 'null',
  })
})

// exports.updateMe = catchAsync(async (req, res, next) => {
//   // Error if user POSTs password data
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(new AppError(400, 'This route is not for updating passwords. Please use /updateMyPassword'));
//   }

//   const filteredBody = filterObj(req.body, 'name', 'email');

//   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });
//   await user.save();

//   res.status(200).json({
//     status: 'success',
//     data: {
//       user: updatedUser
//     }
//   })

// })