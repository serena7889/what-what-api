const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email is not valid'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation required'],
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: 'Passwords must match'
    }
  },
  groups: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Group',
    default: [],
  },
  role: {
    type: String,
    enum: ['student', 'leader', 'admin'],
    required: [true, 'Role is required']
  },
  passwordChangedAt: Boolean,
  passwordResetToken: String,
  passwordResetExpires: Date
})

userSchema.pre('save', async function(next) {
  // Skip if password hasn't been modified
  if (!this.isModified('password')) return next();
  // Hash password with cost 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
})

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.methods.correctPassword = async function(candidatePassword, passwordHash) {
  return await bcrypt.compare(candidatePassword, passwordHash);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  } else {
    return false;
  } 
}

userSchema.methods.createPasswordResetToken = function() {
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    console.log(`RESET TOKEN: ${resetToken}`);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
