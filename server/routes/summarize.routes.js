import express, { Router } from "express";
import { summarize, buildVideo } from "../controllers/summarize.controller.js";

const summarizeRouter = express.Router();

summarizeRouter.post("/summarize", summarize);
summarizeRouter.get("/build-video", buildVideo);

export default summarizeRouter;