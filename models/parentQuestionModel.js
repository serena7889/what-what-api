const mongoose = require('mongoose');
const validator = require('validator');

const parentQuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    validator: [validator.isAlphanumeric]
  },
  children: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'ChildQuestion',
    default: []
  },
  topics: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Topic',
    default: []
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group required'],
  },
  scheduled: {
    type: Boolean,
    default: false
  },
});

parentQuestionSchema.pre('find', function (next) {
  this.populate({
    path: 'children'
  });
  this.populate({
    path: 'topics'
  });
  this.populate({
    path: 'group',
  });
  next();
});

const ParentQuestion = mongoose.model('ParentQuestion', parentQuestionSchema);

module.exports = ParentQuestion;