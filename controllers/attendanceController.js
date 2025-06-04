const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/attendance.json');

// ✅ Get all attendance records
const getAllAttendance = (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
};

// ✅ Update attendance (add date for roll numbers)
const updateAttendance = (req, res) => {
  const { year, month, date, roll_numbers } = req.body;

  if (!year || !month || !date || !Array.isArray(roll_numbers)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let updatedRolls = [];

  roll_numbers.forEach(roll => {
    const index = data.findIndex(member => member.roll == roll);

    if (index !== -1) {
      const member = data[index];
      if (!member.attendance[year]) {
        member.attendance[year] = {};
      }
      if (!member.attendance[year][month]) {
        member.attendance[year][month] = [];
      }
      if (!member.attendance[year][month].includes(date)) {
        member.attendance[year][month].push(date);
        updatedRolls.push(roll);
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({
    message: 'Attendance updated successfully',
    updatedRolls
  });
};

// ✅ Delete attendance (remove date for roll numbers)
const deleteAttendance = (req, res) => {
  const { year, month, date, roll_numbers } = req.body;

  if (!year || !month || !date || !Array.isArray(roll_numbers)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let deletedRolls = [];

  roll_numbers.forEach(roll => {
    const index = data.findIndex(member => member.roll == roll);

    if (index !== -1) {
      const member = data[index];

      if (
        member.attendance[year] &&
        member.attendance[year][month] &&
        member.attendance[year][month].includes(date)
      ) {
        member.attendance[year][month] = member.attendance[year][month].filter(d => d !== date);
        deletedRolls.push(roll);

        if (member.attendance[year][month].length === 0) {
          delete member.attendance[year][month];
        }
        if (Object.keys(member.attendance[year]).length === 0) {
          delete member.attendance[year];
        }
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({
    message: 'Attendance deleted successfully',
    deletedRolls
  });
};

// ✅ Get one member's attendance by roll
const getAttendanceByRoll = (req, res) => {
  const roll = req.params.roll;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const person = data.find(member => member.roll == roll);

  if (!person) {
    return res.status(404).json({ message: 'Member not found' });
  }

  res.json({
    roll: person.roll,
    name: person.name,
    attendance: person.attendance || {}
  });
};

// ✅ Get monthly/yearly summary
const getSummary = (req, res) => {
  const { year, month } = req.body;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const summary = [];

  data.forEach(member => {
    let totalDays = 0;

    if (member.attendance[year]) {
      if (month && member.attendance[year][month]) {
        totalDays = member.attendance[year][month].length;
      } else if (!month) {
        Object.values(member.attendance[year]).forEach(days => {
          totalDays += days.length;
        });
      }
    }

    summary.push({
      roll: member.roll,
      name: member.name,
      days_present: totalDays
    });
  });

  res.json({
    summaryType: month ? `Monthly Summary for ${month} ${year}` : `Yearly Summary for ${year}`,
    summary
  });
};


// ✅ Clear a member's name and attendance data by roll number (keep keys)
const deleteMember = (req, res) => {
  const { rollNumber } = req.body;

  if (!rollNumber) {
    return res.status(400).json({ message: 'Roll number is required' });
  }

  let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const index = data.findIndex(member => member.roll == rollNumber);

  if (index === -1) {
    return res.status(404).json({ message: 'No member found with rollNumber' });
  }

  const memberToUpdate = data[index];
  const previousName = memberToUpdate.name;
  const previousAttendance = memberToUpdate.attendance;

  // Set name to an empty string and attendance to an empty object
  memberToUpdate.name = "";
  memberToUpdate.attendance = {};

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({
    message: `Name and attendance data for roll number ${rollNumber} cleared successfully`,
    clearedDetails: {
      roll: rollNumber,
      previousName: previousName,
      previousAttendance: previousAttendance
    }
  });
};


module.exports = {
  getAllAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByRoll,
  getSummary,
  deleteMember // Export the modified function
};