const mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

const slotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required for timestamp']
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParentQuestion'
  }
});

slotSchema.pre('find', function(next) {
  this.populate({ 
    path: 'question',
  });
  this.populate({
    path: 'leader',
  });

  next();
})

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;