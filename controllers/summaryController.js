const fs = require('fs');
const path = require('path');

const donationsFilePath = path.join(__dirname, '../data/donations.json');
const expensesFilePath = path.join(__dirname, '../data/expense.json');
const deletedDonationsFilePath = path.join(__dirname, '../data/deletedDonations.json'); // New path

// Read donations.json
const readDonationsData = () => {
    try {
        const data = fs.readFileSync(donationsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading donations data for summary:', error);
        return [];
    }
};

// Read expenses.json
const readExpensesData = () => {
    try {
        const data = fs.readFileSync(expensesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading expenses data for summary:', error);
        return [];
    }
};

// Read deletedDonations.json
const readDeletedDonationsData = () => {
    try {
        const data = fs.readFileSync(deletedDonationsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading deleted donations data for summary:', error);
        return [];
    }
};

const getFinancialSummary = (req, res) => {
    try {
        // Total Donations from active members
        const donationsData = readDonationsData();
        let totalDonations = 0;
        donationsData.forEach(member => {
            for (const year in member.donations) {
                for (const month in member.donations[year]) {
                    totalDonations += member.donations[year][month];
                }
            }
        });

        // Total Expenses
        const expensesData = readExpensesData();
        const totalExpenses = expensesData.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

        // Total from deleted donations
        const deletedDonations = readDeletedDonationsData();
        const otherAmount = deletedDonations.reduce((sum, person) => sum + (parseFloat(person.total_donation) || 0), 0);

        // Remaining
        const remainingAmount = totalDonations - totalExpenses;

        // Send final response
        res.json({
            totalDonations: totalDonations,
            totalExpenses: totalExpenses,
            remainingAmount: remainingAmount,
            otherAmount: otherAmount
        });

    } catch (error) {
        console.error('Error getting financial summary:', error);
        res.status(500).json({ message: 'Failed to get financial summary.' });
    }
};

module.exports = {
    getFinancialSummary,
};
