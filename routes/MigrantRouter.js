const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Migrant = require("../models/Migrent");
const { isMainThread } = require("worker_threads");

// 🔧 Auto-create uploads folder if not exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const upload = multer({ storage });

const multipleFields = upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "documentFile", maxCount: 1 },
]);

router.post("/migrants", multipleFields, async (req, res) => {
    try {

        let product = await Migrant.find({})
        let id
        if (product.length !== 0) {
            let lastproduct = product.slice(-1)
            let last = lastproduct[0]
            id = last.id + 1
        } else {
            id = 1
        }
        const {
            name,
            dateOfBirth,
            gender,
            email,
            phoneNumber,
            permanentAddress,
            presentAddress,
            documentType,
            stateOfOrigin,
            languagesKnown,
            migratingToState,
            migratingToCity,
            pinCode,
            migrationDate,
            migrationReason,
        } = req.body;


        const educationDetails = [];
        const workExperience = [];

        // Parse education fields
        for (let key in req.body) {
            if (key.startsWith("educationDetails[")) {
                const [index, field] = key.match(/\[(\d+)\]\[(\w+)\]/).slice(1);
                if (!educationDetails[index]) educationDetails[index] = {};
                educationDetails[index][field] = req.body[key];
            }
        }

        // Parse work experience fields
        for (let key in req.body) {
            if (key.startsWith("workExperience[")) {
                const [index, field] = key.match(/\[(\d+)\]\[(\w+)\]/).slice(1);
                if (!workExperience[index]) workExperience[index] = {};
                workExperience[index][field] = req.body[key];
            }
        }

        const newMigrant = new Migrant({
            id : id,
            name,
            dateOfBirth,
            gender,
            email,
            phoneNumber,
            permanentAddress,
            presentAddress,
            aadhar: req.files?.aadhar?.[0]?.path || "",
            documentType,
            documentFile: req.files?.documentFile?.[0]?.path || "",
            educationDetails,
            workExperience,
            stateOfOrigin,
            languagesKnown,
            migratingToState,
            migratingToCity,
            pinCode,
            migrationDate,
            migrationReason,
        });

        await newMigrant.save();
        res.status(201).json({ message: "Migrant registered successfully!" });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Server error." });
    }
});

router.get('/fetch-migrant', async (req,res)=>{
    try{

        const isFindMigrant = await Migrant.find({})
        if(isFindMigrant){
            return res.send({ success: true, data: isFindMigrant })
        }
        else{
            return res.send({success : false , message : "Can not find the migrant details please try again later!"})
        }

    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Server error." });
    }
})


router.post('/approve-migrant/:id', async (req, res) => {
    try {
        const migrantId = req.params.id;

        const updateResult = await Migrant.updateOne(
            { _id: migrantId },
            { $set: { status: 'Approved', rejectedReason: "" } }
        );

        if (updateResult.modifiedCount === 1) {
            res.json({ success: true, message: 'Migrant approved successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Migrant not found or already approved.' });
        }
    } catch (err) {
        console.error("Error approving migrant:", err);
        res.status(500).json({ success: false, error: 'Failed to approve migrant.' });
    }
});




router.post('/reject-migrant/:id', async (req, res) => {


    try {
        const { reason } = req.body;
        const migrantId = req.params.id;
        await Migrant.updateOne({ _id: migrantId }, {
            $set: { rejectedReason: reason, status: 'Rejected' }
        });
        res.json({ success: true, message: 'Rejection reason saved.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to save rejection reason.' });
    }
});



router.post('/grivence-migrant', async (req, res) => {
    try {
        const { migrantId, grivencestatus } = req.body;

        const result = await Migrant.updateOne(
            { email: migrantId },
            {
                $push: {
                    grivencestatus: { $each: [grivencestatus] }
                }
            }
        );

        console.log("Update Result:", result);

        res.json({ success: true, message: 'Grievance status updated successfully.' });
    } catch (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ success: false, error: 'Failed to update grievance status.' });
    }
});







// PUT: Update Migrant Profile
router.put('/update', async (req, res) => {
    try {
        const {
            email,
            name,
            dateOfBirth,
            gender,
            phoneNumber,
            stateOfOrigin,
            migratingToState,
            migratingToCity,
            migrationDate,
            migrationReason,
            permanentAddress,
            presentAddress,
            pinCode,
            documentType,
            status,
            rejectedReason,
            approvedId,
        } = req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required to update the profile" })
        }

        // Find the migrant by email
        const migrant = await Migrant.findOne({ email })

        if (!migrant) {
            return res.status(404).json({ message: "Migrant not found" })
        }

        // Update fields
        migrant.name = name || migrant.name
        migrant.dateOfBirth = dateOfBirth || migrant.dateOfBirth
        migrant.gender = gender || migrant.gender
        migrant.phoneNumber = phoneNumber || migrant.phoneNumber
        migrant.stateOfOrigin = stateOfOrigin || migrant.stateOfOrigin
        migrant.migratingToState = migratingToState || migrant.migratingToState
        migrant.migratingToCity = migratingToCity || migrant.migratingToCity
        migrant.migrationDate = migrationDate || migrant.migrationDate
        migrant.migrationReason = migrationReason || migrant.migrationReason
        migrant.permanentAddress = permanentAddress || migrant.permanentAddress
        migrant.presentAddress = presentAddress || migrant.presentAddress
        migrant.pinCode = pinCode || migrant.pinCode
        migrant.documentType = documentType || migrant.documentType

        // Optional: Only admins can update status and rejection reason
        if (status) migrant.status = status
        if (status === "Rejected" && rejectedReason) migrant.rejectedReason = rejectedReason
        if (approvedId) migrant.approvedId = approvedId

        await migrant.save()

        res.status(200).json({ message: "Migrant profile updated successfully", migrant })
    } catch (error) {
        console.error("Update Error:", error)
        res.status(500).json({ message: "Server error while updating migrant profile" })
    }
})



router.get('/fetch-migrant-notification', async (req, res) => {
    try {
        // ✅ 1. Check if user is logged in
        if (!req.session.user || !req.session.user.email) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        // ✅ 2. Fetch migrant using correct field (email assumed)
        const fetchMigrant = await Migrant.findOne({ email : req.session.user.email});

        // ✅ 3. Return migrant data
        if (fetchMigrant.length > 0) {
            return res.json({ success: true, data: fetchMigrant });
        } else {
            return res.json({ success: false, message: "Migrant not found" });
        }
    } catch (error) {
        console.error("Fetch Notification Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching notifications" });
    }
});








module.exports = router;
