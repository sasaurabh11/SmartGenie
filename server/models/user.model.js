import mongoose from "mongoose";
import validator from 'validator'

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required: [true, "please provide a name"],
    },
    email: {
        type: String,
        required: [true, "please provide a email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "please provide a valid email"],
        index: true
    },
    password: {
        type: String,
        required: [true, "please provide a password"],
        minlength: 6,
        select: false
    },
    creditBalance: {
        type : Number,
        default : 6,
    },
}, {timestamps : true});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;