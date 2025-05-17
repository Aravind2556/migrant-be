const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({

    degree: String,
    institution: String,
    year: String,
});

const workSchema = new mongoose.Schema({
    jobTitle: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String,
});

const migrantSchema = new mongoose.Schema({
    id : {type : Number , required : true},
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },

    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    presentAddress: { type: String, required: true },

    aadhar: { type: String, required: true }, // file path
    documentType: { type: String },
    documentFile: { type: String }, // optional file path

    educationDetails: [educationSchema],
    workExperience: [workSchema],

    stateOfOrigin: { type: String, required: true },
    languagesKnown: { type: String, required: true },
    migratingToState: { type: String, required: true },
    migratingToCity: { type: String, required: true },
    pinCode: { type: String, required: true },
    migrationDate: { type: Date, required: true },
    migrationReason: { type: String, required: true },
    role : {type : String , default : "user"} ,


    rejectedReason: { type: String, default: null },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    grivencestatus: { type: [String] },



    // New field for Approved Migrant ID
    approvedId: { type: String, default: null },

    createdAt: { type: Date, default: Date.now }
});






module.exports = mongoose.model("Migrant", migrantSchema);
