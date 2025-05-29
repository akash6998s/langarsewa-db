const express = require('express');
const router = express.Router();

const {
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByRoll,
  getSummary
} = require('../controllers/attendanceController');

router.get('/', getAllAttendance);
router.post('/update', updateAttendance);
router.post('/delete', deleteAttendance);
router.get('/:roll', getAttendanceByRoll);
router.post('/summary', getSummary);

module.exports = router;
