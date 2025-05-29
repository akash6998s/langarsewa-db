const fs = require('fs');
const path = require('path');

const getAllMembers = (req, res) => {
  const filePath = path.join(__dirname, '../data/members.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
};

module.exports = { getAllMembers };
