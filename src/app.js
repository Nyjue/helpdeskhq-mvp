const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check used by Docker / Cloud Run to confirm the service is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'helpdeskhq', time: new Date().toISOString() });
});

module.exports = app;
