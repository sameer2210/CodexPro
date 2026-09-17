import express from 'express';
import { generateCodeStream } from '../controllers/geminiController.js';

const dsaRouter = express.Router();

dsaRouter.post('/generate-code', generateCodeStream);

export default dsaRouter;