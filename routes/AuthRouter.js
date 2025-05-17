const Express = require('express')
const UserModel = require('../models/User')
const isAuth = require('../middleware/isAuth')
const MigrantModel = require('../models/Migrent')
const CompanyModel = require('../models/company')

const AuthRouter = Express.Router()

AuthRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login request:", email, password);

    if (!email || !password) {
        return res.send({ success: false, message: 'Please provide all details!' });
    }

    // 1. Try Admin/SuperAdmin
    const user = await UserModel.findOne({ email });

    if (user) {
        if (user.password !== password) {
            return res.send({ success: false, message: "Invalid Password!" });
        }

        req.session.user = {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            contact: user.contact,
            role: user.role, // 'SuperAdmin' or 'Admin'
        };

        return req.session.save((err) => {
            if (err) return res.send({ success: false, message: "Session error!" });
            return res.send({ success: true, message : "login successfully", userType: user.role, user: req.session.user });
        });
    }

    // 2. Try Migrant
    const migrant = await MigrantModel.findOne({ email });

    if (migrant) {
        const dobString = new Date(migrant.dateOfBirth).toISOString().split('T')[0];

        if (dobString !== password) {
            return res.send({ success: false, message: "Invalid Date of Birth!" });
        }

        req.session.user = {
            id: migrant._id,
            fullname: migrant.fullname,
            email: migrant.email,
            contact: migrant.contact,
            role: migrant.role,
        };

        return req.session.save((err) => {
            if (err) return res.send({ success: false, message: "Session error!" });
            return res.send({ success: true, message: "login successfully", userType: migrant.role, user: req.session.user });
        });
    }


    // 2. Try Company
    const company = await CompanyModel.findOne({ email : email });

    if (company) {
        if (company.password !== password) {
            return res.send({ success: false, message: "Invalid Password!" });
        }

        req.session.user = {
            id: company._id,
            email: company.email,
            role: company.role
        };

        return req.session.save((err) => {
            if (err) return res.send({ success: false, message: "Session error!" });
            return res.send({
                success: true,
                message: "Login successfully",
                userType: company.role,
                user: req.session.user
            });
        });
    }

    console.log("req",req.session)

    // Not found in any model
    return res.send({ success: false, message: 'User not found!' });
});




AuthRouter.post('/register', async (req, res)=>{
    try{
        const {fullname, email, contact, password ,userType} = req.body

        console.log("reg:",fullname, email, contact, password ,userType)


        if(!fullname || !email || !contact || !password  || !userType){
            return res.send({success: false, message: 'Please provide all details!'})
        }

        
        const fetchUser = await UserModel.findOne({email: email.toLowerCase()})
        if(fetchUser){
            return res.send({success: false, message: 'Account already exist! Please try login.'})
        }

        let Users = await UserModel.find({});
        let userId;
        if(Users.length>0){
            let last_user = Users.slice(-1)[0];
            userId = last_user.id+1;
        }else{ 
            userId = 1
        }

        const newUser = new UserModel({
            id: userId,
            fullname: fullname,
            email: email,
            contact: contact,
            password: password,
            role : userType
        })

        const saveUser = await newUser.save()

        if(saveUser){

            req.session.user = {
                id: saveUser.id,
                fullname: saveUser.fullname,  
                email: saveUser.email,  
                contact: saveUser.contact,  
                role: saveUser.role,
            }
    
            req.session.save((err)=>{
                if(err){
                    return res.send({success: false, message: "Failed to create session!"})
                }
    
                return res.send({success: true, message: "User Registration successfully!", user: req.session.user})
            })

        }
        else{
            return res.send({success: false, message: 'Failed to create User!'})
        }

    }
    catch(err){
        console.log("Error in Register:",err)
        return res.send({success: false, message: 'Trouble in Registration! Please contact admin.'})
    }
})


// AuthRouter.get('/checkauth', async (req, res) => {
//     try {
//         if (req.session.user) {

//             console.log("req.session",req.session)

//             const fetchUser = await UserModel.findOne({ email: req.session.user.email.toLowerCase() }).select("-password -_id")
//             if (!fetchUser) {
//                 return res.send({ success: false, message: 'User not found!' })
//             }

//             return res.send({ success: true, user: fetchUser, message: "Successfully fetched the current logged in User!" })
//         }
//         else {
//             return res.send({ success: false, message: "No loggin detected! please login and try again." })
//         }
//     }
//     catch (err) {
//         console.log("Error in Checking Authentication:", err)
//         return res.send({ success: false, message: 'Trouble in Checking Authentication! Please contact support Team.' })
//     }
// })




AuthRouter.get('/checkauth', async (req, res) => {
    try {
        if (req.session.user) {
            const email = req.session.user.email.toLowerCase();
            const role = req.session.user.role;

            let fetchUser = null;

            if (role === 'user') {
                fetchUser = await MigrantModel.findOne({ email }).select('-password -_id');
            } 
            else if(role === 'company'){
                fetchUser = await CompanyModel.findOne({ email }).select('-password -_id');
            }
            else {
                fetchUser = await UserModel.findOne({ email }).select('-password -_id');
            }

            if (!fetchUser) {
                return res.send({ success: false, message: 'User not found!' });
            }

            return res.send({ success: true, user: fetchUser, message: 'Successfully fetched the logged-in user!' });
        } else {
            return res.send({ success: false, message: 'No login detected! Please login and try again.' });
        }
    } catch (err) {
        console.error('Error in checking authentication:', err);
        return res.send({ success: false, message: 'Trouble checking authentication! Please contact support.' });
    }
});





AuthRouter.get('/logout', isAuth, async(req, res)=>{
    try{
        console.log("logout called:",req.session.user)
        if(req.session.user){
            req.session.destroy((err) => {
                if (err) {
                    console.log("Error in destroying session:", err);
                    return res.send({ success: false, message: "Failed to log out! Please contact developer." });
                }
                return res.send({ success: true, message: "Logged out successfully!" });
            });            
        }
        else{
            return res.send({success: false, message: "Please login and try again later!"})
        }
    }
    catch(err){
        console.log("Trouble in logging out:",err)
        return res.send({success: false, message: "Trouble in logging out! Please contact support Team."})
    }
})






module.exports = AuthRouter