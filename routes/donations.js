const express = require('express');
const router = express.Router();

const {
  getAllDonations,
  addDonation, // Use the updated function
  deductDonation, // Use the new deduction function
  getTotalDonations, // For all members
  getSingleMemberDonationSummary, // For a single member's summary
} = require('../controllers/donationsControllers');

router.get('/', getAllDonations);
router.post('/', addDonation); // Use POST for adding donations
router.post('/deduct-donation', deductDonation); // Use DELETE for deducting donations
router.get('/total', getTotalDonations); // Get total for all members
router.get('/summary/:roll_no', getSingleMemberDonationSummary); // Get summary for a single member by roll_no

module.exports = router;