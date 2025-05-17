const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: { type: String, required: true },
    jobType: { type: String, required: true },
    experience: { type: String, required: true },
    skills: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
