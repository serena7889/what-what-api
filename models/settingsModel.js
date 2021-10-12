const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  askQuestionPassphrase: String
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;