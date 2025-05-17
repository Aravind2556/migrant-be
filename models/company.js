const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    companyName: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    password: { type: String, required: true},
    companyStartDate: { type: Date, required: true },
    email : {type : String},
    role: { type: String, default: "company"}
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
