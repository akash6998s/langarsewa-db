const fs = require('fs');
const path = require('path');

const donationsFilePath = path.join(__dirname, '../data/donations.json');
const expensesFilePath = path.join(__dirname, '../data/expense.json'); // Corrected from expenses.json

// Helper function to read donations data
const readDonationsData = () => {
    try {
        const data = fs.readFileSync(donationsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading donations data for summary:', error);
        return [];
    }
};

// Helper function to read expenses data
const readExpensesData = () => {
    try {
        const data = fs.readFileSync(expensesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading expenses data for summary:', error);
        return [];
    }
};

const getFinancialSummary = (req, res) => {
    try {
        // Calculate total donations
        const donationsData = readDonationsData();
        let totalDonations = 0;
        donationsData.forEach(member => {
            for (const year in member.donations) {
                for (const month in member.donations[year]) {
                    totalDonations += member.donations[year][month];
                }
            }
        });

        // Calculate total expenses
        const expensesData = readExpensesData();
        const totalExpenses = expensesData.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);

        // Calculate remaining amount
        const remainingAmount = totalDonations - totalExpenses;

        res.json({
            totalDonations: totalDonations,
            totalExpenses: totalExpenses,
            remainingAmount: remainingAmount,
        });

    } catch (error) {
        console.error('Error getting financial summary:', error);
        res.status(500).json({ message: 'Failed to get financial summary.' });
    }
};

module.exports = {
    getFinancialSummary,
};