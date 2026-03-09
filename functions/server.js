const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('../routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// Set up API routes
app.use('/api', apiRoutes);

// Export for Netlify
module.exports.handler = serverless(app);