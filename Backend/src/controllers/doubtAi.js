import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/user.js';

const DoubtAi = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;
    const userId = req.result._id || req.user._id;

    const user = await User.findById(userId);
    if (!user || user.tokensLeft < 10) {
      res.status(403).json({
        success: false,
        msg: 'Insufficient tokens. Please purchase more.',
      });
      return;
    }
    user.tokensLeft -= 10;
    await user.save();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const context = [
      {
        role: 'user',
        parts: [
          {
            text: `You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems on CodeX.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title || 'Not provided'}
[PROBLEM_DESCRIPTION]: ${description || 'Not provided'}
[EXAMPLES]: ${testCases || 'Not provided'}
[startCode]: ${startCode || 'Not provided'}

## YOUR CAPABILITIES:
1. Hint Provider
2. Code Reviewer
3. Solution Guide
4. Complexity Analyzer
5. Approach Suggester

Remember: Encourage understanding over memorization.`,
          },
        ],
      },
      ...messages.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
    ];

    const result = await model.generateContentStream({ contents: context });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${text}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI streaming error:', err);
    res.write(`data: ⚠️ Error: ${err.message}\n\n`);
    res.end();
  }
};

export default DoubtAi;
