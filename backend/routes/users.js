const express = require('express');
const User = require('../models/User');
const Query = require('../models/Query');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarkedQueries', 'title category status createdAt').lean();
    const queryCount = await Query.countDocuments({ author: req.user._id });
    res.json({ ...user, queryCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, college, batch, preferences } = req.body;
    const update = {};
    if (name) update.name = name;
    if (college) update.college = college;
    if (batch) update.batch = batch;
    if (preferences) update.preferences = { ...req.user.preferences, ...preferences };
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: msg });
    }
    res.status(400).json({ error: err.message });
  }
});

router.get('/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarkedQueries',
      populate: { path: 'author', select: 'name avatar' }
    });
    res.json(user.bookmarkedQueries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
});

router.get('/my-queries', protect, async (req, res) => {
  try {
    const queries = await Query.find({ author: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queries.' });
  }
});

router.patch('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

router.delete('/withdraw', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted permanently.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

module.exports = router;
