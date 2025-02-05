import express, { Router } from "express";
import { summarize } from "../controllers/summarize.controller.js";

const summarizeRouter = express.Router();

summarizeRouter.post("/summarize", summarize);

export default summarizeRouter;