const express = require('express');
const CompanyRouter = express.Router();
const CompanyModel = require('../models/company');

// POST: Register new company (no bcrypt)
CompanyRouter.post('/CompanyRegister', async (req, res) => {
    try {
        const {
            companyName,
            location,
            country,
            state,
            pincode,
            password,
            companyStartDate,
            email
        } = req.body;

        // Check if company name already exists
        const existingCompany = await CompanyModel.findOne({ companyName });
        if (existingCompany) {
            return res.status(400).json({ message: 'Company already exists' });
        }

        const newCompany = new CompanyModel({
            companyName,
            location,
            country,
            state,
            pincode,
            password, // 👈 plain text
            companyStartDate,
            email
        });

        await newCompany.save();

        res.status(201).json({ message: 'Company registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = CompanyRouter;

