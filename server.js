const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// Import route modules
const membersRoutes = require('./routes/members');
const attendanceRoutes = require('./routes/attendance');
const donationsRoutes = require('./routes/donations');
const expensesRoutes = require('./routes/expenses');
const summaryRoutes = require('./routes/summary');
const signupRoutes = require('./routes/signup'); // Correctly importing the signup router

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware Setup ---
// Configure CORS to allow specific origins
const allowedOrigins = [
  'https://langarprasadsewa.netlify.app',
  'http://localhost:5173', // For local development
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., from mobile apps, curl)
    // or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow sending cookies/auth headers with requests
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Serve static images from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// --- Route Mounting ---
// Mount specific routes for different API endpoints
app.use('/members', membersRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/donations', donationsRoutes);
app.use('/expenses', expensesRoutes);
app.use('/summary', summaryRoutes);
app.use('/signup', signupRoutes); // Mount the signup router for authentication

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});