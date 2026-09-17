import axios from 'axios';

export const getLanguageById = (lang) => {
  const normalizedLang = lang.toLowerCase();
  const language = {
    'c++': 54,
    cpp: 54,
    java: 91,
    javascript: 93,
  };

  return language[normalizedLang];
};

export const SubmitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'false',
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE_0_API_KEY,
      'x-rapidapi-host': process.env.JUDGE_0_HOST_API,
      'Content-Type': 'application/json',
    },
    data: {
      submissions,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Judge0 Batch Submit Error:', error.message);
    throw error;
  }
};

const waiting = (timer) => {
  return new Promise((resolve) => setTimeout(resolve, timer));
};

export const submitToken = async (resultToken) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(','),
      base64_encoded: 'false',
      fields: '*',
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE_0_API_KEY,
      'x-rapidapi-host': process.env.JUDGE_0_HOST_API,
    },
  };

  async function fetchData() {
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 1000;

    while (true) {
      try {
        const response = await axios.request(options);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          if (retryCount >= maxRetries) {
            throw new Error('Exceeded maximum retries due to rate limiting');
          }
          const delay = baseDelay * Math.pow(2, retryCount);
          console.warn(`Rate limited by Judge0 API. Retrying after ${delay} ms...`);
          await waiting(delay);
          retryCount++;
        } else {
          console.error(error);
          throw error;
        }
      }
    }
  }

  while (true) {
    const result = await fetchData();
    const isResultObtained = await result.submissions.every((r) => r.status.id > 2);

    if (isResultObtained) {
      return result.submissions;
    }

    await waiting(1000);
  }
};

export default { getLanguageById, SubmitBatch, submitToken };
