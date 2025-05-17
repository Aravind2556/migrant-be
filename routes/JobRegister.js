const express = require('express');
const JobRouter = express.Router();
const JobModel = require('../models/Job');

// POST /api/job-post
JobRouter.post('/job-post', async (req, res) => {
    try {
        const newJob = new JobModel(req.body);
        await newJob.save();
        res.status(201).json({ message: 'Job posted successfully', job: newJob });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

JobRouter.get('/fetch-jobs', async (req,res)=>{
    try{

        const isFindJobs = await JobModel.find({})
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


module.exports = JobRouter;
