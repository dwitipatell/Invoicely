import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

const USERNAME_RULE = /^[a-z0-9_]{3,30}$/;

function issueToken(user) {
  return jwt.sign(
    { id: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// POST /api/auth/register  body: { username, password }
router.post('/register', async (req, res, next) => {
  try {
    const username = String(req.body.username ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');

    if (!USERNAME_RULE.test(username)) {
      return res.status(400).json({ message: 'Username must be 3–30 characters: letters, numbers, or underscore.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    if (await User.exists({ username })) {
      return res.status(409).json({ message: 'That username is already taken.' });
    }

    const user = await User.create({
      username,
      passwordHash: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ token: issueToken(user), username: user.username });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login  body: { username, password }
router.post('/login', async (req, res, next) => {
  try {
    const username = String(req.body.username ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');

    const user = await User.findOne({ username });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ message: 'Wrong username or password.' });

    res.json({ token: issueToken(user), username: user.username });
  } catch (err) {
    next(err);
  }
});

export default router;
