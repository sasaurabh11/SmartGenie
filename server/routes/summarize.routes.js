import express, { Router } from "express";
import { summarize, buildVideo } from "../controllers/summarize.controller.js";
import userAuth from "../middlewares/auth.js";

const summarizeRouter = express.Router();

summarizeRouter.post("/summarize", userAuth, summarize);
summarizeRouter.post("/build-video", userAuth, buildVideo);

export default summarizeRouter;