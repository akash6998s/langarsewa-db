const express = require('express');
const router = express.Router();

const {
    getAllExpenses,
    addExpense,
    deleteExpense,
    getTotalExpenses, // <--- Add this line
} = require('../controllers/expensecontrollers');

// GET all expenses
router.get('/', getAllExpenses);

// GET total expenses
router.get('/total', getTotalExpenses); // <--- Add this line

// POST add a new expense
router.post('/add', addExpense);

// DELETE expense by id
router.delete('/:id', deleteExpense);

module.exports = router;