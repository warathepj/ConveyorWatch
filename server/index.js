// server/index.js
const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Use cors middleware

function generateRandomNumber() {
  return Math.floor(Math.random() * 101); // Generates a number between 0 and 100
}

app.get('/randomNumber', (req, res) => {
  const randomNumber = generateRandomNumber();
  res.json({ randomNumber });
});

console.log("Starting random number generation...");

setInterval(() => {
  const randomNumber = generateRandomNumber();
  console.log(`Generated random number: ${randomNumber}`);
}, 3000); // 3000 milliseconds = 3 seconds

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
