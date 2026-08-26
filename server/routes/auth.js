const express = require('express');
const router = express.Router();
const { User, Department } = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'User not found with this email' });
    }

    if (password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({
      user: safeUser,
      token: `demo_token_${user.id}_${Date.now()}`
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', rollNo, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser = new User({
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role === 'admin' ? 'admin' : (role === 'staff' ? 'staff' : 'student'),
      rollNo: rollNo ? rollNo.trim() : `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department ? department.trim() : 'General',
      phone: phone ? phone.trim() : '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    await newUser.save();

    const safeUser = newUser.toObject();
    delete safeUser.password;

    res.status(201).json({
      user: safeUser,
      token: `demo_token_${newUser.id}_${Date.now()}`
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// GET /api/auth/departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    console.error('Fetch departments error:', err);
    res.status(500).json({ error: 'Failed to retrieve departments' });
  }
});

module.exports = router;
