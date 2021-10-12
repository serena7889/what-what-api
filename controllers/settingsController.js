const catchAsync = require('./../utils/catchAsync');
const Settings = require('../models/settingsModel');

exports.checkAskQuestionPassphrase = catchAsync(async (req, res, next) => {
  console.log(req.params.phrase);
  const phrase = req.params.phrase;
  const found = await Settings.findOne({ 'askQuestionPassphrase': phrase });
  res.status(200).json({
    'status': 'success',
    'data': found != null,
  });
})

exports.updateAskQuestionPassphrase = catchAsync(async (req, res, next) => {
  const phrase = req.params.phrase;
  await Settings.findOneAndUpdate({}, {'askQuestionPassphrase': phrase});
  res.status(200).json({
    'status': 'success',
  });
}) 
