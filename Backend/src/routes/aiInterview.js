import express from 'express';
import multer from 'multer';
import { handleAssistantQuery } from '../controllers/aiAssistantController.js';
import DoubtAi from '../controllers/doubtAi.js';
import {
  continueInterview,
  createSession,
  endInterview,
  getFeedback,
  getSessionStatus,
  interviewSessions,
  saveRecording,
  uploadResume,
} from '../controllers/interview.js';
import { checkPremiumAndTokens, userMiddleware } from '../middlewares/userMiddleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const interviewRouter = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.'));
    }
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
  }

  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

interviewRouter.post('/create-session', asyncHandler(createSession));
interviewRouter.post('/continue', asyncHandler(continueInterview));
interviewRouter.post('/end', asyncHandler(endInterview));
interviewRouter.get('/session/:sessionId', asyncHandler(getSessionStatus));
interviewRouter.post('/chat', userMiddleware, checkPremiumAndTokens, DoubtAi);
interviewRouter.get('/assistant', userMiddleware, handleAssistantQuery);

interviewRouter.post(
  '/upload-resume',
  upload.single('resume'),
  handleMulterError,
  asyncHandler(uploadResume)
);

interviewRouter.get('/feedback/:sessionId', asyncHandler(getFeedback));
interviewRouter.post(
  '/generate-feedback/:sessionId',
  asyncHandler(async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = interviewSessions.get(sessionId);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const prompt = `Evaluate interview for session ${sessionId}. Skills: ${session.keySkills.join(', ')}`;

      const result = await model.generateContent(prompt);
      let feedback;

      try {
        const responseText = result.response.text().trim();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        feedback = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (parseError) {
        feedback = {
          overallScore: 65,
          technicalScore: 60,
          communicationScore: 70,
          strengths: ['Completed the interview', 'Showed engagement'],
          weaknesses: ['Could provide more detailed responses'],
          improvements: ['Practice explaining technical concepts with examples'],
          detailedAnalysis: 'Good participation in the interview.',
        };
      }

      const userResponseCount = session.conversation.filter((msg) => msg.role === 'user').length;
      const interviewDuration = Math.floor((Date.now() - session.startTime) / 1000);

      const detailedFeedback = {
        feedback,
        sessionStats: {
          duration: interviewDuration,
          questionsAnswered: userResponseCount,
          averageResponseTime: Math.round(interviewDuration / userResponseCount) || 0,
          completionRate: Math.round((userResponseCount / 5) * 100),
          keySkillsEvaluated: session.keySkills,
        },
        interviewHistory: session.conversation.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
        generatedAt: new Date().toISOString(),
      };

      if (!global.interviewFeedback) {
        global.interviewFeedback = new Map();
      }
      global.interviewFeedback.set(sessionId, detailedFeedback);

      res.json({
        success: true,
        data: detailedFeedback,
      });
    } catch (error) {
      console.error('❌ Feedback generation error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate feedback',
      });
    }
  })
);

interviewRouter.post(
  '/interview/save-recording',
  upload.single('recording'),
  handleMulterError,
  asyncHandler(saveRecording)
);

interviewRouter.use((err, req, res, next) => {
  console.error('Interview router error:', err);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

export default interviewRouter;
