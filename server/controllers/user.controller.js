import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export {registerUser, loginUser};  