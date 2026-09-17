import express from 'express';
import {
  checkIfVideoExists,
  deleteVideo,
  generateUploadSignature,
  saveVideoMetadata,
} from '../controllers/videoSection.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const videoRouter = express.Router();

videoRouter.get('/create/:problemId', adminMiddleware, generateUploadSignature);
videoRouter.post('/save', adminMiddleware, saveVideoMetadata);
videoRouter.delete('/delete/:problemId', adminMiddleware, deleteVideo);
videoRouter.get('/videoExists/:problemId', adminMiddleware, checkIfVideoExists);

export default videoRouter;