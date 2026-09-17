import express from 'express';
import discussionController from '../controllers/discussionController.js';
import { optionalUserMiddleware, userMiddleware } from '../middlewares/userMiddleware.js';

const discussionRouter = express.Router();

discussionRouter.post('/', userMiddleware, discussionController.createDiscussion);

discussionRouter.get('/', optionalUserMiddleware, discussionController.getDiscussions);

discussionRouter.get('/:id', optionalUserMiddleware, discussionController.getDiscussionById);

discussionRouter.put('/:id', userMiddleware, discussionController.updateDiscussion);

discussionRouter.delete('/:id', userMiddleware, discussionController.deleteDiscussion);

discussionRouter.get('/:discussionId/comments', optionalUserMiddleware, discussionController.getComments);

discussionRouter.post('/:discussionId/comments', userMiddleware, discussionController.addComment);

discussionRouter.put('/comments/:commentId', userMiddleware, discussionController.updateComment);

discussionRouter.delete('/comments/:commentId', userMiddleware, discussionController.deleteComment);

discussionRouter.post('/:id/vote', userMiddleware, discussionController.voteDiscussion);

discussionRouter.post('/comments/:commentId/vote', userMiddleware, discussionController.voteComment);

export default discussionRouter;