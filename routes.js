const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const BabyProfile = require('./models/BabyProfile');
const MilkIntake = require('./models/MilkIntake');

const router = express.Router();

// Middleware for token verification
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token) {
    jwt.verify(token, 'secretkey', (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
};

// Routes
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.sendStatus(201);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, 'secretkey');
    res.json({ token });
  } else {
    res.sendStatus(401);
  }
});

router.get('/baby-profiles', authenticate, async (req, res) => {
  const profiles = await BabyProfile.find({ userId: req.userId });
  res.json(profiles);
});

router.post('/baby-profile', authenticate, async (req, res) => {
  const profile = new BabyProfile({ userId: req.userId, ...req.body });
  await profile.save();
  res.sendStatus(201);
});

router.get('/milk-intake/:babyId', authenticate, async (req, res) => {
  const records = await MilkIntake.find({ userId: req.userId, babyId: req.params.babyId });
  res.json(records);
});

router.post('/milk-intake', authenticate, async (req, res) => {
  const intake = new MilkIntake({ userId: req.userId, ...req.body });
  await intake.save();
  res.sendStatus(201);
});

router.get('/milk-intake-summary/:babyId', authenticate, async (req, res) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const summary = await MilkIntake.aggregate([
    { $match: { userId: req.userId, babyId: mongoose.Types.ObjectId(req.params.babyId), date: { $gte: currentDate, $lt: nextDate } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json(summary.length ? summary[0].total : 0);
});

module.exports = router;
