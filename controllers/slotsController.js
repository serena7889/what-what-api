const catchAsync = require('./../utils/catchAsync');
// const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');
const Slot = require('../models/slotModel');

exports.getSlots = catchAsync(async (req, res, next) => {
  const slots = await Slot.find();
  res.status(200).json({
    'status': 'success',
    'data': slots,
    'results': slots.length
  });
})

exports.getSlot = catchAsync(async (req, res, next) => {
  const slot = await Slot.findById(req.params.slotId);
  res.status(200).json({
    'status': 'success',
    'data': slot
  });
})

exports.createSlot = catchAsync(async (req, res, next) => {
  const slot = await Slot.create({ 'date': req.body.date });
  console.log(`SLOT: ${req.body.date}`)
  res.status(200).json({
    'status': 'success',
    'data': slot
  });
})

exports.assignQuestionAndLeaderToSlot = catchAsync(async (req, res, next) => {
  const { leaderId, questionId } = req.body;
  if (!leaderId || !questionId) return next(new AppError(400, 'Leader or question id not provided'));
  const updatedSlot = await Slot.findByIdAndUpdate(req.params.slotId, { 'leader': leaderId, 'question': questionId, 'scheduled': true }, { new: true });
  if (!updatedSlot) return next(new AppError(400, 'Slot not found for id or update failed'));
  res.status(200).json({
    'status': 'success',
    'data': updatedSlot
  })
})

exports.removeQuestionAndLeaderFromSlot = catchAsync(async (req, res, next) => {
  const slot = await Slot.findByIdAndUpdate(req.params.slotId, { 'question': null, 'leader': null, 'scheduled': false });
  res.status(200).json({
    'status': 'success',
    'data': slot
  })
})

exports.removeSlot = catchAsync(async (req, res, next) => {
  const slot = await Slot.findByIdAndRemove(req.params.slotId);
  res.status(200).json({
    'status': 'success'
  })
})