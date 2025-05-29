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

  if (!rollNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  const userExists = users.find((user) => user.rollNumber === rollNumber);
  if (userExists) {
    return res
      .status(409)
      .json({ message: "User already exists with this roll number." });
  } // Default status is pending

  const newUser = { rollNumber, email, password, status: "pending" };
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

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (user.status !== "approved") {
    return res.status(403).json({
      message: `Access denied. Your account status is '${user.status}'.`,
    });
  }

  res.status(200).json({ message: "Login successful.", user });
});

// POST route to update user status or delete user
router.post("/update-status", (req, res) => {
  const { rollNumber, status } = req.body;

  if (!rollNumber || !status) {
    return res
      .status(400)
      .json({ message: "rollNumber and status are required." });
  }

  let users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  const userIndex = users.findIndex((user) => user.rollNumber === rollNumber);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found." });
  } // Handle delete status

  if (status.toLowerCase() === "delete") {
    users.splice(userIndex, 1); // Remove the user from the array
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return res
      .status(200)
      .json({
        message: `User with roll number ${rollNumber} deleted successfully.`,
      });
  } // Normalize status for update: only 'approved' or 'reject' are accepted, else 'pending'

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
