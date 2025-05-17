const express = require('express');
const JobApplicationModel = require('../models/JobApplication'); // Create this model
const JobApplicationRouter = express.Router();

JobApplicationRouter.post('/apply-job', async (req, res) => {
     try {
         const { jobId, jobTitle } = req.body;

         const user = req.session.user.email

         if (!jobId || !jobTitle) {
             return res.status(400).json({ message: 'Missing required fields' });
         }
         if (!user) {
             return res.send({ success: false, message: "user not found" })
        }
        const newApplication = new JobApplicationModel({
            jobId,
            jobTitle,
            MigrentId : user
            
        });

        await newApplication.save();

        res.status(201).json({ message: 'Job applied successfully' });
    } catch (error) {
        console.error('Apply Job Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


JobApplicationRouter.get('/fetch-Aplly-jobs', async (req,res)=>{
    try{

        const isFindJobs = await JobApplicationModel.find({})
        if (isFindJobs){
            return res.send({ success: true, data: isFindJobs })
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

module.exports = JobApplicationRouter;
