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
  }
});

const ChildQuestion = mongoose.model('ChildQuestion', childQuestionSchema);

module.exports = ChildQuestion;