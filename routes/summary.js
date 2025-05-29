const express = require('express');
const router = express.Router();
const { getFinancialSummary } = require('../controllers/summaryController');

// GET financial summary (total donations, total expenses, remaining amount)
router.get('/financial', getFinancialSummary);

module.exports = router;