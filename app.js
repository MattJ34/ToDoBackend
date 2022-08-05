const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const todoRoutes = require('./api/routes/todo');
const userRoutes = require('./api/routes/users');

app.use(bodyParser.json());

app.use('/todo', todoRoutes);
app.use('/user', userRoutes);

module.exports = app;