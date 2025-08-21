const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const express = require('express');
const app = express();
const port = 3001;

app.use(express.json()); // Enable parsing of JSON request bodies
app.use(express.static(__dirname));

app.post('/update-speed', (req, res) => {
  const { speed } = req.body;
  console.log('Received speed via HTTP:', speed);
  // Here you would typically update the hardware simulator's speed
  // For now, we just log it and send a success response
  res.status(200).send('Speed updated successfully');
});

app.listen(port, () => {
  console.log(`Hardware simulator web server listening at http://localhost:${port}`);
});

let countdown = 60;
const totalDuration = 15000; // 15 seconds in milliseconds
const intervalTime = totalDuration / countdown; // Calculate interval for 60 steps in 15 seconds

const countdownInterval = setInterval(() => {
  if (countdown >= 0) {
    console.log(`Countdown: ${countdown}`);
    client.publish('conveyor/countdown', countdown.toString());
    countdown--;
  } else {
    for (let i = 0; i < 5; i++) {
      console.log("Countdown: 0");
      client.publish('conveyor/countdown', "0");
    }
    clearInterval(countdownInterval);
    console.log("Countdown finished!");
    client.end(); // Close MQTT connection when done
  }
}, intervalTime);
