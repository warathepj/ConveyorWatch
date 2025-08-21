const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const express = require('express');
const app = express();
const port = 3001;

let lastReceivedSpeed = 0; // Initialize with 0

app.use(express.json()); // Enable parsing of JSON request bodies
app.use(express.static(__dirname));

app.post('/update-speed', (req, res) => {
  const { speed } = req.body;
  console.log('Received speed via HTTP:', speed);
  lastReceivedSpeed = speed; // Update the last received speed
  // Here you would typically update the hardware simulator's speed
  // For now, we just log it and send a success response
  res.status(200).send('Speed updated successfully');
});

app.listen(port, () => {
  console.log(`Hardware simulator web server listening at http://localhost:${port}`);
});

// New interval to publish speed every 2 seconds
setInterval(() => {
  if (lastReceivedSpeed !== null) { // Ensure a speed has been received
    client.publish('conveyor/speed', lastReceivedSpeed.toString());
    console.log(`Published speed via MQTT: ${lastReceivedSpeed}`);
  }
}, 2000); // 2000 milliseconds = 2 seconds
