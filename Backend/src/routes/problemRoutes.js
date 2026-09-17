import express from 'express';
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  getProfileAllProblems,
  getProfileProblemsSolved,
  problemsSolvedByUser,
  submittedProblem,
  updateProblem,
} from '../controllers/userProblems.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { userMiddleware } from '../middlewares/userMiddleware.js';

const problemRouter = express.Router();

problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.put('/update/:id', adminMiddleware, updateProblem);
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);

problemRouter.get('/getProblemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getAllProblems', userMiddleware, getAllProblems);
problemRouter.get('/problemsSolvedByUser', userMiddleware, problemsSolvedByUser);
problemRouter.get('/submittedProblem/:pid', userMiddleware, submittedProblem);

problemRouter.get('/profile/problemsSolved', userMiddleware, getProfileProblemsSolved);
problemRouter.get('/profile/allProblems', userMiddleware, getProfileAllProblems);

export default problemRouter;
