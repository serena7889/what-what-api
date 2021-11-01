const catchAsync = require('../utils/catchAsync');
const Topic = require('../models/groupModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const Group = require('../models/groupModel');

exports.getGroups = catchAsync(async (req, res, next) => {
  const groups = await Group.find();

    // RETURN RESPONSE
    res.status(200).json({
      status: 'success',
      results: groups.length,
      data: groups,
    });
})

exports.createGroup = catchAsync(async (req, res, next) => {
  const newGroup = await Group.create({ name: req.body.name });
  res.status(200).json({
    status: 'success',
    data: newGroup
  })
})