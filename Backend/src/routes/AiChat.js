import express from 'express';
import { handleAssistantQuery } from '../controllers/aiAssistantController.js';
import DoubtAi from '../controllers/doubtAi.js';
import { checkPremiumAndTokens, userMiddleware } from '../middlewares/userMiddleware.js';

const aiRouter = express.Router();

aiRouter.post('/chat', userMiddleware, checkPremiumAndTokens, DoubtAi);
aiRouter.post('/assistant', userMiddleware, handleAssistantQuery);

aiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      assistant: 'online',
      doubt_solver: 'online',
    },
    timestamp: new Date().toISOString(),
  });
});

aiRouter.get('/capabilities', (req, res) => {
  res.json({
    assistant: {
      name: 'CodeX AI Assistant',
      version: '2.0',
      capabilities: [
        'Platform navigation',
        'Feature explanations',
        'Contest information',
        'Course recommendations',
        'General coding guidance',
      ],
      available_routes: [
        '/dashboard',
        '/contests',
        '/premium',
        '/doubt',
        '/submissions',
        '/leaderboard',
        '/courses',
        '/explore',
      ],
    },
    doubt_solver: {
      name: 'CodeX Doubt AI',
      version: '1.0',
      requirements: ['premium_subscription', 'sufficient_tokens'],
      capabilities: [
        'Code debugging',
        'Algorithm explanations',
        'Concept clarification',
        'Best practices guidance',
      ],
    },
  });
});

export default aiRouter;
