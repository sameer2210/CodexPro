import React, { createContext, useContext, useState } from "react";

const ContestContext = createContext();

export const ContestProvider = ({ children }) => {
  const [contest, setContest] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const value = {
    contest,
    setContest,
    participants,
    setParticipants,
    hasEntered,
    setHasEntered,
    hasCompleted,
    setHasCompleted,
  };

  return (
    <ContestContext.Provider value={value}>{children}</ContestContext.Provider>
  );
};

export const useContest = () => {
  const context = useContext(ContestContext);
  if (!context) {
    return {
      contest: null,
      setContest: () => {},
      participants: [],
      setParticipants: () => {},
      hasEntered: false,
      setHasEntered: () => {},
      hasCompleted: false,
      setHasCompleted: () => {},
    };
  }
  return context;
};
