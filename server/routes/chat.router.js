import express, { Router } from "express";
import {chatController} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.post("/", chatController);

export default chatRouter;