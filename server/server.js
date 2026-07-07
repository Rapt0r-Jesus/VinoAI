const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const scanRouter = require('./routes/scan');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/v1/scan', scanRouter);
app.use('/api/v1/wines', scanRouter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`VinoAI server running on port ${PORT}`));

module.exports = app;
