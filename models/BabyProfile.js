const mongoose = require('mongoose');

const babyProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  sex: { type: String, required: true }
});

module.exports = mongoose.model('BabyProfile', babyProfileSchema);
