// routes/profile.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/user');
const auth = require('../middleware/auth');



// GET route to retrieve profile data for the logged-in user
router.get('/info', auth, async (req, res) => {
  try {

    // Find the profile and populate user details (name, email, and password)
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email password');

    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile); // Send profile data to the frontend

  } catch (error) {
    console.error(error.message);

    res.status(500).send('Server error');
  }
});

// PUT route to update the user's password
router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ msg: "New passwords do not match" });
  }

  try {
    const user = await User.findById(req.user.id); // Fetch the user from the DB
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Old password is incorrect" });
    }

    // Hash and save the new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Server error');
  }
});
  // PUT route to update profile fields
router.put('/update', auth, async (req, res) => {
  const { userId, name, dateOfBirth, cinNumber, phoneNumber, email } = req.body;
  const targetUserId = userId || req.user.id; // Use userId from request body if available, otherwise fallback to authenticated user

  try {
    // Update User model if name or email is provided
    if (name || email) {
      await User.findByIdAndUpdate(targetUserId, { name, email }, { new: true });
    }

    // Update Profile model for other fields
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: targetUserId },
      { dateOfBirth, cinNumber, phoneNumber },
      { new: true }
    );

    res.json(updatedProfile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


const multer = require('multer');
const path = require('path');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// File upload endpoint
router.put('/upload/:field', auth, upload.single('file'), async (req, res) => {
  try {
    const field = req.params.field;
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    await Profile.findOneAndUpdate(
      { user: req.user.id },
      { [field]: fileUrl },
      { new: true }
    );
    res.json({ fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});






  module.exports = router;

