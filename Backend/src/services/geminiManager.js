import { GoogleGenerativeAI } from '@google/generative-ai';

const envKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

const keys = envKeys.length > 0 ? envKeys : ['dummy_key'];

let currentIndex = 0;

export function getNextKey() {
  const key = keys[currentIndex];
  currentIndex = (currentIndex + 1) % keys.length;
  return key;
}

export function getGeminiClient() {
  const key = getNextKey();
  return new GoogleGenerativeAI(key);
}

export default { getGeminiClient, getNextKey };
