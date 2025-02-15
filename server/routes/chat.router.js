import express, { Router } from "express";
import {chatController} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.get("/", chatController);

export default chatRouter;