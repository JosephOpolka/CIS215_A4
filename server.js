"use strict"
const express = require('express');
const bodyParser = require('body-parser');
// express instance
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const http = require('http');

app.post('/api/drivers', (req, res) => {
  const {
    firstName, lastName, dob, address, licenseNumber
  } = req.body;

  const newDriver = new Driver({
    firstName,
    lastName,
    dob,
    address,
    licenseNumber
  });
  // json driver creation
  newDriver.save()
    .then(driver => {
      res.status(201).json({ message: 'Driver created successfully', driver });
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to create driver', message: error.message });
    });
});

// Creating server, sends back response
/*
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Welcome to this server.\n');
});
*/

const PORT = 3000;
// server creation log
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});