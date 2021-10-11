const catchAsync = require('./../utils/catchAsync');
const ParentQuestion = require('./../models/parentQuestionModel');
const ChildQuestion = require('./../models/childQuestionModel');
const Slot = require('./../models/slotModel');
const Topic = require('./../models/topicModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');
// const User = require('../models/userModel');

// HELPERS

const getFilteredChildQuestions = async (status, req, res, next) => {
  const features = await new APIFeatures(ChildQuestion.find({ 'status': status }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const filteredQuestions = await features.query;

    res.status(200).json({
      status: 'success',
      results: filteredQuestions.length,
      data: filteredQuestions,
    });
}

exports.reset = catchAsync(async (req, res, next) => {
  await ChildQuestion.deleteMany();
  await Slot.deleteMany();
  await ParentQuestion.deleteMany();
  await Topic.deleteMany();
  res.status(200).json({
    'status': 'success'  
  });
})

// ROUTE HANDLERS

exports.getScheduledQuestions = catchAsync(async (req, res, next) => {
  let futureSlots = await Slot.find({ 'date': { '$gt': Date.now() } }).sort('date');
  res.status(200).json({
    'status': 'success',
    'data': futureSlots,
    'results': futureSlots.length
  });
})

exports.getAnsweredQuestions = catchAsync(async (req, res, next) => {
  let pastSlots = await Slot.find({ 'date': { '$lt': Date.now() } }).where({ 'question': { '$ne': null } });
  res.status(200).json({
    'status': 'success',
    'data': pastSlots,
    'results': pastSlots.length
  });
})

exports.getAvailableQuestions = catchAsync(async (req, res, next) => {
  const availableQuestions = await ParentQuestion.find({ 'scheduled': false });
  res.status(200).json({
    'status': 'success',
    'results': availableQuestions.length,
    'data': availableQuestions
  });
})

exports.getRejectedQuestions = catchAsync(async (req, res, next) => {
  await getFilteredChildQuestions('rejected', req, res, next);
})

exports.getUnapprovedQuestions = catchAsync(async (req, res, next) => {
  await getFilteredChildQuestions('unapproved', req, res, next);
})

exports.createUnapprovedQuestion = catchAsync(async (req, res, next) => {
  const newQuestion = await ChildQuestion.create({
    'question': req.body.question,
    'dateAsked': Date.now()
  });
  res.status(200).json({
    'status': 'success',
    'data': newQuestion
  });
})

exports.rejectQuestion = catchAsync(async (req, res, next) => {
  const questionId = req.params.questionId;
  if (!questionId) return next(new AppError(400, 'Question id not found'));
  const rejectedQuestion = await ChildQuestion.findOneAndUpdate({ '_id': questionId }, { 'status': 'rejected' }, { new: true })
  if (!rejectedQuestion) return next(new AppError(400, `Question with id: ${questionId} not found`));
  res.status(200).json({
    'status': 'success',
    'data': rejectedQuestion
  });
})

exports.createNewParentQuestion = catchAsync(async (req, res, next) => {
  const question = req.body.question;
  const children = req.body.children;
  if (!question || !children || children.length === 0 ) return next(new AppError(400, 'Incorrect body to create parent question'));
  const topics = req.body.topics || [];
  children.forEach(async childId => {
    if (!(await ChildQuestion.findById(childId, { 'status': 'unapproved' }))) return next(new AppError(400, `Child with id ${childId} does not exist or is not unapproved`));
  });
  children.forEach(async childId => {
    await ChildQuestion.findByIdAndUpdate(childId, { 'status': 'approved' });
  })
  const newParentQuestion = await ParentQuestion.create({
    'text': question,
    'children': children,
    'topics': topics
  });
  res.status(200).json({
    'status': 'success',
    'data': newParentQuestion
  });
})

exports.addChildToParentQuestion = catchAsync(async (req, res, next) => {
  const childId = req.params.childId;
  const parentId = req.params.parentId;
  const childQuestion = await ChildQuestion.findById(childId);
  const parentQuestion = await ParentQuestion.findById(parentId);
  console.log(parentQuestion);
  if (!childQuestion || !parentQuestion || !childQuestion.status === 'unapproved') return next(new AppError(400, `Child (${childId}) or parent (${parentId}) question not found or child status not allowed`));
  childQuestion.status = 'approved';
  await childQuestion.save();
  parentQuestion.children.push(childId);
  await parentQuestion.save();
  res.status(200).json({
    'status': 'success',
    'data': parentQuestion
  });
})

exports.assignTopicsToQuestion = catchAsync(async (req, res, next) => {
  const topicId = req.params.topicId;
  const questionId = req.params.questionId;
  const topic = await Topic.findById(topicId);
  const question = await ParentQuestion.findById(questionId);
  if (!topic || !question) return next(new AppError(400, `Topic (${topicId}) or parent question (${parentId}) not found`));
  if (question.topics.includes(topicId)) return next(new AppError(400, `Question already has topid ${topic.name}`));
  question.topics.push(topicId);
  await question.save();
  res.status(200).json({
    'status': 'success',
    'data': question
  });
})