const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const usersFile = path.join(__dirname, "../data/users.json");

// Ensure the users.json file exists
try {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]", "utf8");
    console.log("users.json created.");
  }
} catch (error) {
  console.error("Error ensuring users.json exists:", error);
}

const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

const writeUsersToFile = (users) => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing users file:", error);
  }
};

// POST /signup - Register a new user
router.post("/", (req, res) => {
  const { rollNumber, email, password } = req.body;

  if (!rollNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required (roll number, email, password)." });
  }

  const numericRollNumber = Number(rollNumber);
  if (isNaN(numericRollNumber)) {
    return res.status(400).json({ message: "Roll number must be a valid number." });
  }

  const users = readUsersFromFile();

  const rollNumberExists = users.some((user) => Number(user.rollNumber) === numericRollNumber);
  if (rollNumberExists) {
    return res.status(409).json({ message: "A user with this roll number already exists." });
  }

  const emailExists = users.some((user) => user.email === email);
  if (emailExists) {
    return res.status(409).json({ message: "A user with this email address already exists." });
  }

  const newUser = { rollNumber: numericRollNumber, email, password, status: "pending" };
  users.push(newUser);

  writeUsersToFile(users);
  res.status(201).json({
    message: "Signup request sent successfully. Please wait for admin approval.",
  });
});

// POST /signup/login - Authenticate a user
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required for login." });
  }

  const users = readUsersFromFile();

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (user.status !== "approved") {
    return res.status(403).json({
      message: `Access denied. Your account status is '${user.status}'. Please contact the admin.`,
    });
  }

  res.status(200).json({
    message: "Login successful.",
    rollNumber: user.rollNumber,
    email: user.email,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin
  });
});

// POST /signup/update-status - Update a user's approval status (Admin function)
router.post("/update-status", (req, res) => {
  const { rollNumber, status } = req.body;

  if (!rollNumber || !status) {
    return res.status(400).json({ message: "Roll number and status are required to update user status." });
  }

  const numericRollNumber = Number(rollNumber);
  if (isNaN(numericRollNumber)) {
    return res.status(400).json({ message: "Roll number must be a valid number." });
  }

  let users = readUsersFromFile();

  const userIndex = users.findIndex((user) => Number(user.rollNumber) === numericRollNumber);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found with the provided roll number." });
  }

  let normalizedStatus;
  if (status.toLowerCase() === "approved") {
    normalizedStatus = "approved";
  } else if (status.toLowerCase() === "reject") {
    normalizedStatus = "reject";
  } else {
    normalizedStatus = "pending";
  }

  users[userIndex].status = normalizedStatus;

  writeUsersToFile(users);
  res.status(200).json({
    message: `User status for roll number ${numericRollNumber} updated to '${normalizedStatus}'.`,
  });
});

// POST /signup/delete-user - Delete a user by roll number (Admin function)
router.post("/delete-user", (req, res) => {
  const { rollNumber } = req.body;

  if (!rollNumber) {
    return res.status(400).json({ message: "Roll number is required to delete a user." });
  }

  const numericRollNumber = Number(rollNumber);
  if (isNaN(numericRollNumber)) {
    return res.status(400).json({ message: "Roll number must be a valid number." });
  }

  let users = readUsersFromFile();
  const initialLength = users.length;

  users = users.filter((user) => Number(user.rollNumber) !== numericRollNumber);

  if (users.length === initialLength) {
    return res.status(404).json({ message: `No user found with roll number ${numericRollNumber}.` });
  }

  writeUsersToFile(users);
  res.status(200).json({
    message: `User with roll number ${numericRollNumber} deleted successfully.`,
  });
});

// POST /signup/update-admin - Update a user's admin status (Admin function)
router.post("/update-admin", (req, res) => {
  const { rollNumber, admin } = req.body;

  if (typeof rollNumber === "undefined" || typeof admin === "undefined") {
    return res.status(400).json({ message: "Roll number and admin status are required." });
  }

  const numericRollNumber = Number(rollNumber);
  if (isNaN(numericRollNumber)) {
    return res.status(400).json({ message: "Roll number must be a valid number." });
  }

  const users = readUsersFromFile();

  const userIndex = users.findIndex((user) => Number(user.rollNumber) === numericRollNumber);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found with the provided roll number." });
  }

  users[userIndex].isAdmin = Boolean(admin);

  writeUsersToFile(users);
  res.status(200).json({
    message: `Admin status for roll number ${numericRollNumber} updated to '${admin}'.`,
  });
});

// GET /signup - Fetch all users (Admin function)
router.get("/", (req, res) => {
  const users = readUsersFromFile();
  res.status(200).json(users);
});

module.exports = router;
