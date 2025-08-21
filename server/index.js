// server/index.js
const express = require('express');
const cors = require('cors'); // Import the cors package
const mqtt = require('mqtt'); // Import the mqtt package
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use cors middleware

let currentSpeed = 0; // Initialize currentSpeed

// MQTT Client setup
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Connect to local Mosquitto broker

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('conveyor/speed', (err) => {
    if (!err) {
      console.log('Subscribed to conveyor/speed topic');
    } else {
      console.error('Failed to subscribe:', err);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  if (topic === 'conveyor/speed') {
    const receivedSpeed = parseInt(message.toString(), 10);
    if (!isNaN(receivedSpeed)) {
      currentSpeed = receivedSpeed;
      console.log(`Received conveyor speed from MQTT: ${currentSpeed}`);
    }
  }
});

mqttClient.on('error', (err) => {
  console.error('MQTT Error:', err);
});


app.get('/conveyorSpeed', (req, res) => { // New endpoint for conveyor speed
  res.json({ conveyorSpeed: currentSpeed });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
