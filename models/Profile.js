// models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateOfBirth: { type: Date, default: null },
  cinNumber: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  driverLicensePicture: { type: String, default: '' },
  cinPicture: { type: String }

});
module.exports = mongoose.model('Profile', ProfileSchema);
