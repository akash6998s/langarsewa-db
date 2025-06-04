const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const usersFile = path.join(__dirname, "../data/users.json");

// Ensure users.json exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]", "utf8");
}

// POST route for signup
router.post("/", (req, res) => {
  const { rollNumber, email, password } = req.body;

  // Convert rollNumber to a number and validate
  const numericRollNumber = Number(rollNumber);
  if (isNaN(numericRollNumber) || !email || !password) {
    return res.status(400).json({ message: "All fields (including a valid roll number) are required." });
  }

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  // Check if user exists with this roll number (comparing as numbers)
  const rollNumberExists = users.find((user) => Number(user.rollNumber) === numericRollNumber);
  if (rollNumberExists) {
    return res
      .status(409)
      .json({ message: "User already exists with this roll number." });
  }

  // Check if user exists with this email address
  const emailExists = users.find((user) => user.email === email);
  if (emailExists) {
    return res
      .status(409)
      .json({ message: "User already exists with this email address." });
  }

  // Create new user with numeric rollNumber
  const newUser = { rollNumber: numericRollNumber, email, password, status: "pending" };
  users.push(newUser);

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.status(201).json({
    message: "Request sent. Please wait until the admin approves your account",
  });
});


// POST route for login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  // Find user by email and password
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (user.status !== "approved") {
    return res.status(403).json({
      message: `Access denied. Your account status is '${user.status}'.`,
    });
  }

  res.status(200).json({
    message: "Login successful.",
    rollNumber: user.rollNumber // rollNumber will be returned as stored (now numeric)
  });
});


// POST route to update user status
router.post("/update-status", (req, res) => {
  const { rollNumber, status } = req.body;

  // Convert rollNumber to a number and validate
  const numericRollNumber = Number(rollNumber);
  if (isNaN(numericRollNumber) || !status) {
    return res
      .status(400)
      .json({ message: "rollNumber (as a valid number) and status are required." });
  }

  let users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  // Find user index by numeric rollNumber
  const userIndex = users.findIndex((user) => Number(user.rollNumber) === numericRollNumber);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found." });
  }

  // Normalize status for update: only 'approved' or 'reject' are accepted, else 'pending'
  let normalizedStatus;
  if (status.toLowerCase() === "approved") {
    normalizedStatus = "approved";
  } else if (status.toLowerCase() === "reject") {
    normalizedStatus = "reject";
  } else {
    normalizedStatus = "pending";
  }

  users[userIndex].status = normalizedStatus;

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res
    .status(200)
    .json({ message: `User status updated to ${normalizedStatus}.` });
});

// DELETE route to delete a user by rollNumber
router.post("/delete-user", (req, res) => {
  const { rollNumber } = req.body; // Expect rollNumber in the request body

  // Convert rollNumber to a number and validate
  const numericRollNumber = Number(rollNumber);
  if (isNaN(numericRollNumber)) {
    return res.status(400).json({ message: "A valid rollNumber (as a number) is required." });
  }

  let users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  const initialLength = users.length;
  // Filter out the user with the matching numeric rollNumber
  users = users.filter((user) => Number(user.rollNumber) !== numericRollNumber);

  if (users.length === initialLength) {
    // If the length hasn't changed, no user was found and deleted
    return res.status(404).json({ message: "No member found with rollNumber." });
  }

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.status(200).json({ message: `User with roll number ${numericRollNumber} deleted successfully.` });
});


// GET route to fetch all users
router.get("/", (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error reading users file." });
  }
});

module.exports = router;
