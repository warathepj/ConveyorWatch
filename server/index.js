// server/index.js
const express = require('express');
const cors = require('cors'); // Import the cors package
const mqtt = require('mqtt'); // Import the mqtt package
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use cors middleware

let currentNumber = 40; // Initialize currentNumber here so it's accessible to the API

// MQTT Client setup
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Connect to local Mosquitto broker

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('conveyor/countdown', (err) => {
    if (!err) {
      console.log('Subscribed to conveyor/countdown topic');
    } else {
      console.error('Failed to subscribe:', err);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  if (topic === 'conveyor/countdown') {
    const receivedNumber = parseInt(message.toString(), 10);
    if (!isNaN(receivedNumber)) {
      currentNumber = receivedNumber;
      console.log(`Received countdown number from MQTT: ${currentNumber}`);
    }
  }
});

mqttClient.on('error', (err) => {
  console.error('MQTT Error:', err);
});

app.get('/countdownNumber', (req, res) => { // New endpoint for countdown
  res.json({ countdownNumber: currentNumber });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
