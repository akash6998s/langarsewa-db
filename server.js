const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const membersRoutes = require('./routes/members');
const attendanceRoutes = require('./routes/attendance');
const donationsRoutes = require('./routes/donations');
const expensesRoutes = require('./routes/expenses');
const summaryRoutes = require('./routes/summary');
const signupRoutes = require('./routes/signup'); // Correctly importing the signup router

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({
  origin: 'https://langarprasadsewa.netlify.app',
  credentials: true
}));

app.use(bodyParser.json());

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/members', membersRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/donations', donationsRoutes);
app.use('/expenses', expensesRoutes);
app.use('/summary', summaryRoutes);
app.use('/signup', signupRoutes); // Correctly mounting the signup router

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});