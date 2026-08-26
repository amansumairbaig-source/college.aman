require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'College Complaint Management API (MongoDB Atlas)' });
});

// Fallback for SPA routing in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), err => {
    if (err) {
      res.status(200).send('API Server is running on port ' + PORT + '. Run the frontend development server via `npm run dev`.');
    }
  });
});

// Start Server after connecting to MongoDB
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 College Complaint Management API running on http://localhost:${PORT}`);
  });
}

startServer();
