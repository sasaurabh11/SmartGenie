import { registerUser, loginUser, userCredits, paymentRazorpay } from "../controllers/user.controller.js";
import express, { Router } from "express";
import userAuth from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/credits", userAuth, userCredits);
userRouter.post("/pay-razor", userAuth, paymentRazorpay);

export default userRouter;