// Ai/MicInput.jsx
import React from "react";
import { startSpeechRecognition } from "../../utils/Ai/speechToText";
import axiosClient from "../../utils/axiosClient";

const MicInput = ({ sessionId, onAIResponse, onUserInput }) => {
  const handleMicClick = () => {
    startSpeechRecognition(async (transcript) => {
      onUserInput(transcript); // send to parent
      if (!sessionId) return;
      const res = await axiosClient.post("/ai/continue", {
        sessionId,
        userAnswer: transcript,
      });
      onAIResponse(res.data?.data?.question);
    });
  };

  return <button onClick={handleMicClick}>🎤 Speak Answer</button>;
};

export default MicInput;
