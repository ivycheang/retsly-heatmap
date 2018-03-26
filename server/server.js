'use strict';

// Imports
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(PORT, HOST);
console.log(`Listening on http://${HOST}:${PORT}`);