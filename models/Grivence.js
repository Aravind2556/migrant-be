const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
    },
    grievanceCategory: {
        type: String,
        required: true,
    },
    grievanceDescription: {
        type: String,
        required: true,
    },
    consent: {
        type: Boolean,
        required: true,
    },
    submittedByEmail: {
        type: String,
        required: true
    },

    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Grievance', grievanceSchema);

