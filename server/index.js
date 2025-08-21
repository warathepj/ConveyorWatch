// server/index.js
const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use cors middleware

let currentNumber = 40; // Initialize currentNumber here so it's accessible to the API

app.get('/countdownNumber', (req, res) => { // New endpoint for countdown
  res.json({ countdownNumber: currentNumber });
});

console.log("Starting countdown from 40 to 0 over 10 seconds...");

const countdownInterval = setInterval(() => {
  if (currentNumber >= 0) {
    console.log(`Generated number: ${currentNumber}`);
    currentNumber--;
  } else {
    console.log("Countdown finished.");
    clearInterval(countdownInterval);
  }
}, 250); // 250 milliseconds = 0.25 seconds, for 40 steps in 10 seconds

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
