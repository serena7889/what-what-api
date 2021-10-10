const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const email = require('./../utils/email');

const signToken = id => {
  return jwt.sign(
    { id: id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).send({
    status: 'success',
    token: token,
    data: user
  });
}

exports.leaderSignUp = catchAsync(async (req, res, next) => {
  // DO NOT create user like this - anyone can make them self admin
  // const newUser = await User.create(req.body);
  // DO create user like this so you choose which fields are used
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: 'leader'
  })
  createSendToken(newUser, 201, res);
})

exports.studentSignUp = catchAsync(async (req, res, next) => {
  // DO NOT create user like this - anyone can make them self admin
  // const newUser = await User.create(req.body);
  // DO create user like this so you choose which fields are used
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: 'student'
  })
  createSendToken(newUser, 201, res);
})

exports.logIn = catchAsync(async (req, res, next) => {

  const { email, password } = req.body;

  // 1) Check email and password exist
  if (!email || !password) return next(new AppError(400, 'You must include email and password'));

  // 2) Check user exists and password is correct
  // User same error for both to not give attackers info

  console.log(`Email: ${email}, Password: ${password}`);
  const emailOrPasswordError = new AppError(401, 'Incorrect email or password')
  const user = await User.findOne({ email: email }).select('+password');
  console.log(`USER FOUND: ${user.email ?? 'none'}`);
  if (!user || user.email != email) return next(emailOrPasswordError);
  const passwordCorrect = await user.correctPassword(password, user.password);
  if (!passwordCorrect) return next(emailOrPasswordError);
  
  // 3) If successful, return token to client
  createSendToken(user, 201, res);
})

exports.getUserFromToken = catchAsync(async (req, res, next) => {
  // 1) Check token is present
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check user still exists
  const foundUser = await User.findById(decoded.id);
  if (!foundUser) return next(new AppError(401, 'User owning token no longer exists'));
  
  // 4) Check is password changed since token issued
  if (foundUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(401, 'User changed password recently. Please log in again.'));
  }

  // 5) Grant access to protected route
  res.status(200).json({
    status: 'success',
    data: foundUser,
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Check token is present
  let token;
  console.log(req.headers);
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  };
  console.log(`Token: ${token}`);

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check user still exists
  const foundUser = await User.findById(decoded.id);
  if (!foundUser) console.log('User owning token no longer exists');
  if (!foundUser) return next(new AppError(401, 'User owning token no longer exists'));
  console.log(`User: ${foundUser.name}`);
  
  // 4) Check is password changed since token issued
  if (foundUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(401, 'User changed password recently. Please log in again.'));
  }
  if (foundUser.changedPasswordAfter(decoded.iat)) {
    console.log('User changed password recently. Please log in again.');
  }
  console.log(`Made it past user check`);

  // 5) Grant access to protected route
  req.user = foundUser;
  next();
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    console.log(`ROLE: ${userRole}`);
    if (!userRole) return next(new AppError(401, 'Logged in user not found'));
    if (!roles.includes(userRole)) return next(new AppError(403, `You do not have permission to perform this action`));
    next();
  }
}


exports.forgotPassword = catchAsync(async (req, res, next) => {

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError(404, `There is no user with email: ${req.body.email}`));

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  user.passwordResetToken = resetToken;
  await user.save({ validateBeforeSave: false });

  // 3) Send email to user with token
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;
  
  try {
    await email({
      email: user.email,
      subject: 'Your password reset token (VALID 10 MINS)',
      message: message
    })
  
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new AppError(500, 'There was an error sending email. Try again later.'));
  }

})

exports.resetPassword = catchAsync(async (req, res, next) => {

  // 1) Get user based on token

  const user = await User.findOne({ 
    passwordResetToken: `${req.params.token}`,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and user exists, set new password

  if (!user) return next(new AppError(400, 'Token is invalid or expired'));

  user.password = req.body.password;
  user.passwordConfirm = req.body.confirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // 3) Update changedPasswordAt property for user
  // Done using middleware

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);

})

exports.updatePassword = catchAsync(async (req, res, next) => {

  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  if (!currentPassword || !newPassword || !newPasswordConfirm) return next(new AppError(400, 'You must include currentPassword, newPassword, newPasswordConfirm'));

  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new AppError(400, 'User not found'));

  // Check if POSTed password is correct
  const passwordCorrect = await user.correctPassword(currentPassword, user.password);
  if (!passwordCorrect) return next(new AppError(401, 'CurrentPassword is incorrect'));

  // If so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  // Log user in, send JWT
  createSendToken(user, 200, res);

})