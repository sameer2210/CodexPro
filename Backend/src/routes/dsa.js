import express from "express";
import { generateCodeStream } from "../controllers/geminiController.js";
import { userMiddleware } from "../middlewares/userMiddleware.js";

const dsaRouter = express.Router();

dsaRouter.post("/generate-code", userMiddleware, generateCodeStream);

export default dsaRouter;
