const mongoose = require('mongoose');
const validator = require('validator');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A topic must have a name'],
    min: [3, 'Topic must have at least 3 chars'],
    max: [20, 'Topic must not have more than 20 chars']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group required'],
  },
})

topicSchema.pre('find', function(next) {
  this.populate({
    path: 'group',
  });
  next();
})

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
