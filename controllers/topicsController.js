const catchAsync = require('./../utils/catchAsync');
const Topic = require('./../models/topicModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getTopics = catchAsync(async (req, res, next) => {
  const features = await new APIFeatures(Topic.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const topics = await features.query;

    // RETURN RESPONSE
    res.status(200).json({
      status: 'success',
      results: topics.length,
      data: topics,
    });
})

exports.createTopic = catchAsync(async (req, res, next) => {
  const newTopic = await Topic.create(req.body);
  res.status(200).json({
    status: 'success',
    data: newTopic
  })
})