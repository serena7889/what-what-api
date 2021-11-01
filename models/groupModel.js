const mongoose = require('mongoose');
const validator = require('validator');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A group must have a name'],
    min: [3, 'Group must have at least 3 chars'],
    max: [30, 'Group must not have more than 20 chars']
  }
})

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
