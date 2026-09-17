import express from 'express';
import { runCode, submitCode } from '../controllers/userSubmission.js';
import { userMiddleware } from '../middlewares/userMiddleware.js';

const submissionRouter = express.Router();

submissionRouter.post('/submit/:id', userMiddleware, submitCode);
submissionRouter.post('/run/:id', userMiddleware, runCode);

export default submissionRouter;
