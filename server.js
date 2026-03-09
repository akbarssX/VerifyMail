const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
// Make sure the path to api.js is correct based on your folder structure
const apiRoutes = require('../routes/api'); 

const app = express();

app.use(cors());
app.use(express.json());

// Set up your API routes
app.use('/api', apiRoutes);

// EXPORT FOR NETLIFY (Notice there is no app.listen here)
module.exports.handler = serverless(app);