const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/expense.json");

// Get all expenses
const getAllExpenses = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    console.error("Error reading expenses:", error);
    res.status(500).json({ message: "Failed to read expenses" });
  }
};

// Add a new expense
const addExpense = (req, res) => {
  const { year, month, amount, description } = req.body;

  if (!year || !month || !amount || !description) {
    return res
      .status(400)
      .json({ message: "year, month, amount, and description are required" });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const newExpense = {
      id: Date.now(), // unique ID generated here
      year: parseInt(year),
      month: parseInt(month),
      amount: parseFloat(amount),
      description,
    };

    data.push(newExpense);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.status(201).json({ message: "Expense added", expense: newExpense });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

// Delete expense by id
const deleteExpense = (req, res) => {
  const id = parseInt(req.params.id);

  try {
    let data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const initialLength = data.length;
    data = data.filter((expense) => expense.id !== id);

    if (data.length === initialLength) {
      return res.status(404).json({ message: "Expense not found" });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

// Get total expenses
const getTotalExpenses = (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const total = data.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0
    );
    res.json({ totalExpenses: total });
  } catch (error) {
    console.error("Error calculating total expenses:", error);
    res.status(500).json({ message: "Failed to calculate total expenses" });
  }
};

module.exports = {
  getAllExpenses,
  addExpense,
  deleteExpense,
  getTotalExpenses, // <--- Add this line
};
