import { GoogleGenerativeAI } from '@google/generative-ai';

export const handleAssistantQuery = async (req, res) => {
  const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Gemini API key missing' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const platformContext = `
      You are CodeX, an AI assistant for a comprehensive coding platform designed to help developers improve their programming skills.

**About CodeX:**
CodeX is a one-stop coding platform that offers problem-solving practice, competitive programming, and technical interview preparation for developers of all skill levels.

**Platform Features:**
- Thousands of coding problems across various difficulty levels and topics
- Regular coding contests with real-time participation and leaderboards  
- AI-powered interview simulator for technical interview practice
- Personal dashboard for progress tracking and performance analytics
- Detailed submission history and solution reviews
- Premium features for enhanced learning experiences
- Community learning from other programmers' solutions

**Available Platform Routes:**
- /dashboard: User's personal dashboard
- /contest: List of ongoing and upcoming contests  
- /premium: Information about premium features
- /interview: AI-powered interview practice
- /problems: Main problem listing page

**Instructions:**
Determine if the user's query is a navigation request.
- If the query is a navigation request, respond with ONLY the JSON object: {"route": "/path"}.
- If general, provide a helpful response.
    `;

    const prompt = `${platformContext}\n\nUser query: "${query}"`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const result = await model.generateContentStream(prompt);

    let fullResponse = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    try {
      const potentialJson = fullResponse.trim();
      if (potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
        const jsonResponse = JSON.parse(potentialJson);
        if (jsonResponse.route) {
          res.write(`event: navigation\ndata: ${potentialJson}\n\n`);
        }
      }
    } catch (e) {
      // Not a JSON response
    }

    res.end();
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to process your request.' })}\n\n`);
    res.end();
  }
};

export default { handleAssistantQuery };