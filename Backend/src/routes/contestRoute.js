import express from 'express';
import contestController from '../controllers/contestController.js';
import contestSubmissionController from '../controllers/contestSubmissionController.js';
import leaderboardController from '../controllers/leaderboardController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { userMiddleware } from '../middlewares/userMiddleware.js';

const contestRouter = express.Router();

contestRouter.get('/today', contestController.getTodayContest);
contestRouter.post('/create', adminMiddleware, contestController.createContest);
contestRouter.get('/problems', adminMiddleware, contestController.getAllProblems);
contestRouter.get('/', contestController.getAllContests);
contestRouter.get('/:id', contestController.getContestById);
contestRouter.put('/update/:id', adminMiddleware, contestController.updateContest);
contestRouter.delete('/delete/:id', adminMiddleware, contestController.deleteContest);

contestRouter.get('/:contestId/problems', contestController.getContestProblems);
contestRouter.get('/:contestId/problem/:problemId', contestController.getContestProblem);
contestRouter.post('/:contestId/register', userMiddleware, contestController.registerForContest);
contestRouter.get('/:contestId/status', userMiddleware, contestController.getContestStatus);

contestRouter.get('/:contestId/leaderboard', leaderboardController.getContestLeaderboard);
contestRouter.post('/:contestId/finalize', adminMiddleware, leaderboardController.finalizeContestRankings);
contestRouter.get('/user/history', userMiddleware, leaderboardController.getUserContestHistory);

contestRouter.post(
  '/:contestId/problem/:problemId/submit',
  userMiddleware,
  contestSubmissionController.submitContestCode
);
contestRouter.post(
  '/:contestId/problem/:problemId/run',
  userMiddleware,
  contestSubmissionController.runContestCode
);
contestRouter.get(
  '/:contestId/problem/:problemId/submissions',
  userMiddleware,
  contestSubmissionController.getUserContestSubmissions
);

export default contestRouter;
