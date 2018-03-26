'use strict';

// Imports
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const bridge = {
  datasetID: 'test',
  accessToken: '6baca547742c6f96a6ff71b138424f21'
};
const queryParams = {
  fields: [
    'Latitude',
    'Longitude'
  ],
  limit: 100,
  poly: [
    -122.299250, 37.707985,
    -122.377871, 37.853778,
    -122.556390, 37.796635,
    -122.507638, 37.707985
  ]
};

// Server Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Handle PoST request
app.post('/', (request, response) => {
  if ((!Number(request.body.offset) && request.body.offset !== '0') || Number(request.body.offset) < 0) {
    console.log(`Request parameter offset ${request.body.offset} is not a positive number`);
    response.send({
      success: false,
      error: 'Request parameter offset must be a positive number'
    });
    console.log('Error response sent');
    return;
  }
  const offset = request.body.offset ? Number(request.body.offset) : 0;
  console.log(`POST request received with offset ${offset}`);

  // Construct path based on params
  let path = `/api/v2/${bridge.datasetID}/listings?access_token=${bridge.accessToken}`;
  for (const key in queryParams) {
    let params;
    if (Array.isArray(queryParams[key])) {
      params = queryParams[key].join(',');
    }
    else {
      params = queryParams[key];
    }
    path += `&${key}=${params}`;
  }
  path += `&offset=${offset}`;

  // Make request to Bridge API
  const options = {
    hostname: 'rets.io',
    path: encodeURI(path),
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = ``;
    
    try {
      res.on('data', (d) => {
        data += d;
      });
      res.on('end', () => {
        const apiResponse = JSON.parse(data);
        if (!apiResponse.success || !Array.isArray(apiResponse.bundle)) {
          console.log(`API request failed: ${JSON.stringify(apiResponse)}`);
          response.send({
            success: false,
            error: 'Request failed'
          });
          console.log('Error response sent');
        } else {
          const heatmapData = apiResponse.bundle.map(listing => {
            return {
              latitude: listing.Latitude,
              longitude: listing.Longitude
            };
          });
          const end = (offset + heatmapData.length) >= Number(apiResponse.total);
          response.send({
            success: true,
            end: end,
            heatmapData: heatmapData
          });
          console.log('Success response sent');
        }
      });
    }
    catch (err) {
      console.trace(err);
      response.send({
        success: false,
        error: 'Internal server error'
      });
      console.log('Error response sent');
    }
  }).on('error', (err) => {
    console.trace(err);
    response.send({
      success: false,
      error: 'Internal server error'
    });
    console.log('Error response sent');
  });
  req.end();
});

app.listen(PORT, HOST);
console.log(`Listening on http://${HOST}:${PORT}`);