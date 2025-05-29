const express = require('express');
const router = express.Router();
const { getAllMembers } = require('../controllers/membersController');

router.get('/', getAllMembers);

module.exports = router;
