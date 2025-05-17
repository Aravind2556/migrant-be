const express = require('express');
const GrievanceModel = require('../models/Grivence');
const isAuth = require('../middleware/isAuth')

const GrievanceRouter = express.Router();

GrievanceRouter.post('/grievance', async (req, res) => {
    try {
        
        const { subject, grievanceCategory, grievanceDescription, consent } = req.body;

        const user = req.session.user.email
        console.log("user",user)

        if (!consent) {
            return res.status(400).json({ message: 'Consent is required.' });
        }
        const newGrievance = new GrievanceModel({
            subject,
            grievanceCategory,
            grievanceDescription,
            consent,
            submittedByEmail: user,
        });

        await newGrievance.save();
        res.status(201).json({ message: 'Grievance submitted successfully' });
    } catch (error) {
        console.error('Error saving grievance:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});


GrievanceRouter.get('/fetch-grievance', async (req,res)=>{
    try{

        const isFindgrievance = await GrievanceModel.find({})
        if (isFindgrievance){
            return res.send({ success: true, data: isFindgrievance })
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






module.exports = GrievanceRouter;
