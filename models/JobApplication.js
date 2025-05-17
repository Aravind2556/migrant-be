const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Job',
    },
    MigrentId : {
        type : String
    },

    jobTitle : {

        type : String

    },

    appliedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
