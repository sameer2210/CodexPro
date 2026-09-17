import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateCodeStream = async (req, res) => {
  try {
    const { dsaType, prompt, language = 'javascript' } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const fullPrompt = `
      Generate a ${language} function that demonstrates ${dsaType} operations.
      ${prompt ? `Additional requirements: ${prompt}` : ''}
      
      Requirements:
      1. Use modern syntax for the chosen language (e.g., ES6 for JavaScript, modern C++).
      2. Include detailed comments to explain the code.
      3. Focus on creating operations that are easy to visualize.
      4. Return only the raw code, without any surrounding text or explanations.
    `;

    const result = await model.generateContentStream(fullPrompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Error generating code:', error.stack || error);
    const errorMessage = error.message || 'Failed to generate code';
    res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
};

export default { generateCodeStream };
