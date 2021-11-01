const mongoose = require('mongoose');
const validator = require('validator');

const childQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    min: [10, 'Question must be at least 10 chars'],
    validator: [validator.isAlphanumeric]
  },
  dateAsked: {
    type: Date,
    required: [true, 'Date asked required']
  },
  status: {
    type: String,
    enum: ['unapproved', 'approved', 'rejected'],
    required: [true, 'Question status required'],
    default: 'unapproved'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group required'],
  },
});

childQuestionSchema.pre('find', function (next) {
  this.populate({
    path: 'group',
  });
  next();
});

const ChildQuestion = mongoose.model('ChildQuestion', childQuestionSchema);

module.exports = ChildQuestion;