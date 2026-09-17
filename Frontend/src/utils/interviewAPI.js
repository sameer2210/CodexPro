import { useState } from 'react';
import axiosClient from './axiosClient';

export const createInterviewSession = async (config) => {
  const res = await axiosClient.post('/ai/create-session', config);
  return res.data;
};

export const handleAPIError = (error) => {
  return error.response?.data?.message || error.message || 'An error occurred';
};

export const useInterviewAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSession = async (config) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.post('/ai/create-session', config);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create session';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const continueInterview = async (sessionId, responseText) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.post('/ai/continue', { sessionId, responseText });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to continue interview';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.post('/ai/end', { sessionId });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to end interview';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSessionStatus = async (sessionId) => {
    try {
      const res = await axiosClient.get(`/ai/session/${sessionId}`);
      return res.data;
    } catch (err) {
      console.warn('Failed to get session status', err);
      return null;
    }
  };

  const getFeedback = async (sessionId) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/ai/feedback/${sessionId}`);
      return res.data;
    } catch (err) {
      console.warn('Failed to get feedback', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async (sessionId) => {
    try {
      setLoading(true);
      const res = await axiosClient.post(`/ai/generate-feedback/${sessionId}`);
      return res.data;
    } catch (err) {
      console.warn('Failed to generate feedback', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createSession,
    continueInterview,
    endInterview,
    getSessionStatus,
    getFeedback,
    generateFeedback,
  };
};

export default useInterviewAPI;
