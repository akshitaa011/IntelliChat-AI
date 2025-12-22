const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const imageRoutes = require('./routes/imageRoutes');
const generationRoutes = require('./routes/generationRoutes');

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/generate', generationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'IntelliChat AI Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all route - serve index.html for any non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: { 
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Start server - THIS WAS MISSING!
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🚀 IntelliChat AI Server Running   ║
╚══════════════════════════════════════╝
  
📍 URL: http://localhost:${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
✅ Status: Ready to serve requests!
  `);
});

module.exports = app;