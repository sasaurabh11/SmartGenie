import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import razorpay from "razorpay";
import transactionModel from "../models/transaction.model.js";

const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({ success : false, message : "All fields are required"});
        }

        const existedUser = await userModel.findOne({email : email});
        if(existedUser) {
            return res.status(400).json({success : false, message : "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        console.log(salt)
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password : hashedPassword,
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn : "1h"});

        res.status(200).json({success : true, token, user : {name : user.name}});

    } catch (error) {
        console.error("Error in registering user", error);
        res.status(500).json({success : false, message : error.message});
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({success : false, message : "All fields are required"});
        }

        const user = await userModel.findOne({email : email});

        if(!user) {
            return res.status(400).json({success : false, message : "User does not exists"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({success : false, message : "Invalid credentials"});
        }

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn : "1h"});

        return res.status(200).json({success : true, token, user : {name : user.name}});
    } catch (error) {
        console.error("Error in login user", error);
        res.status(500).json({success : false, message : error.message});
    }
}

const userCredits = async (req, res) => {
    try {
        const {userId} = req.body;

        const user = await userModel.findById(userId);

        res.status(200).json({success : true, credits: user.creditBalance, user : {name : user.name}});
    } catch (error) {
        console.error("Error in user credits", error);
        res.status(500).json({success : false, message : error.message});
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const paymentRazorpay = async (req, res) => {
    try {

        const {userId, planId} = req.body;

        console.log(userId, planId);

        const userData = await userModel.findById(userId);
        if(!userData || !planId) {
            return res.status(400).json({success : false, message : "Missing Details"});
        }

        let credits, plan, amount, date;

        switch (planId) {
            case 'Basic':
                plan = 'Basic';
                credits = 100;
                amount = 899;
                break;
            
            case 'Advanced':
                plan = 'Advanced';
                credits = 500;
                amount = 4499;
                break;

            case 'Business':
                plan = 'Business';
                credits = 5000;
                amount = 19999;
                break;
        
            default:
                return res.status(400).json({success : false, message : "Invalid Plan"});
        }

        date = Date.now();

        const transactionData = {
            userId,
            plan,
            credits,
            amount,
            date,
        }
        
        const newTransaction = await transactionModel.create(transactionData);

        const options = {
            amount : amount * 100,
            currency : process.env.CURRENCY,
            receipt: newTransaction._id,
        }

        await razorpayInstance.orders.create(options, (error, order) => {
            if(error) {
                console.log("Error in creating order", error);
                return res.status(500).json({success : false, message : error.message});
            }

            res.json({success : true, order});
        })
        
    } catch (error) {
        console.error("Error in razorpay payment", error);
        res.status(500).json({success : false, message : error.message});
    }
}

export {registerUser, loginUser, userCredits, paymentRazorpay};  