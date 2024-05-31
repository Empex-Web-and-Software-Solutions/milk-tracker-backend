const mongoose = require('mongoose');

const milkIntakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  babyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'BabyProfile' },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MilkIntake', milkIntakeSchema);
