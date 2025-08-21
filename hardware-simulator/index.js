const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

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
