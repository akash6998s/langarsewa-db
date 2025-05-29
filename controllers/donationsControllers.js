const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/donations.json");

// Helper function to read data
const readDonationsData = () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading donations data:", error);
    return []; // Return empty array if file is empty or corrupted
  }
};

// Helper function to write data
const writeDonationsData = (data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing donations data:", error);
  }
};

// --- GET All Donations (Unchanged) ---
const getAllDonations = (req, res) => {
  const data = readDonationsData();
  res.json(data);
};

// --- Add a New Donation (Add to existing amount) ---
// Expected payload: { roll_no, year, month, amount }
const addDonation = (req, res) => { // Renamed from addOrUpdateDonation for clarity based on new logic
  const { roll_no, year, month, amount } = req.body;

  if (!roll_no || !year || !month || amount === undefined || amount === null || typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({ message: "roll_no, year, month, and a valid non-negative amount are required." });
  }

  let data = readDonationsData();
  const memberIndex = data.findIndex(member => member.roll === String(roll_no));

  if (memberIndex === -1) {
    return res.status(404).json({ message: `Member with roll number ${roll_no} not found.` });
  }

  const member = data[memberIndex];
  const lowerCaseMonth = month.toLowerCase();

  // Initialize year if it doesn't exist for the member
  if (!member.donations[year]) {
    member.donations[year] = {};
  }

  // Add to existing amount, or set if it's a new entry
  if (member.donations[year][lowerCaseMonth]) {
    member.donations[year][lowerCaseMonth] += amount;
  } else {
    member.donations[year][lowerCaseMonth] = amount;
  }

  writeDonationsData(data);
  res.status(200).json({ message: "Donation added successfully.", memberDonations: member.donations[year][lowerCaseMonth] });
};


// --- Delete/Deduct Donation ---
// Expected payload for deduction: { roll_no, year, month, amount }
const deductDonation = (req, res) => { // Renamed from deleteDonation for clarity based on new logic
  const { roll_no, year, month, amount } = req.body;

  if (!roll_no || !year || !month || amount === undefined || amount === null || typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({ message: "roll_no, year, month, and a valid non-negative amount to deduct are required." });
  }

  let data = readDonationsData();
  const memberIndex = data.findIndex(member => member.roll === String(roll_no));

  if (memberIndex === -1) {
    return res.status(404).json({ message: `Member with roll number ${roll_no} not found.` });
  }

  const member = data[memberIndex];
  const lowerCaseMonth = month.toLowerCase();

  if (member.donations[year] && member.donations[year][lowerCaseMonth] !== undefined) {
    let currentAmount = member.donations[year][lowerCaseMonth];
    let newAmount = currentAmount - amount;

    if (newAmount <= 0) {
      delete member.donations[year][lowerCaseMonth]; // Remove if amount is zero or negative
      // Optional: If the year becomes empty, you might want to delete the year object too
      if (Object.keys(member.donations[year]).length === 0) {
        delete member.donations[year];
      }
      writeDonationsData(data);
      res.status(200).json({ message: `Donation for roll_no ${roll_no} in ${month}, ${year} deducted and removed as amount is zero or negative.` });
    } else {
      member.donations[year][lowerCaseMonth] = newAmount;
      writeDonationsData(data);
      res.status(200).json({ message: `Donation for roll_no ${roll_no} in ${month}, ${year} deducted successfully. New amount: ${newAmount}.` });
    }
  } else {
    res.status(404).json({ message: `No donation found for roll_no ${roll_no} in ${month}, ${year} to deduct from.` });
  }
};


// --- Get Total Donations of All Members (Unchanged) ---
const getTotalDonations = (req, res) => {
  const data = readDonationsData();
  let totalSum = 0;

  data.forEach(member => {
    for (const year in member.donations) {
      for (const month in member.donations[year]) {
        totalSum += member.donations[year][month];
      }
    }
  });

  res.json({ total_donations_of_all_members: totalSum });
};

// --- Get All Months of All Year Summary Donation of a Single Member ---
const getSingleMemberDonationSummary = (req, res) => { // Renamed for clarity
  const roll_no = req.params.roll_no;

  if (!roll_no) {
    return res.status(400).json({ message: "Roll number is required." });
  }

  const data = readDonationsData();
  const member = data.find(m => m.roll === String(roll_no));

  if (!member) {
    return res.status(404).json({ message: `Member with roll number ${roll_no} not found.` });
  }

  // Return the entire donations object for the member
  res.json({ roll_no: roll_no, donations_summary: member.donations });
};


module.exports = {
  getAllDonations,
  addDonation, // Now adds to existing amount
  deductDonation, // Now deducts from existing amount
  getTotalDonations, // For all members
  getSingleMemberDonationSummary, // For a single member (summary by year/month)
};