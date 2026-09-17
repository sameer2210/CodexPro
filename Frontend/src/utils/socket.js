import { getSocket } from '../store/socketMiddleware';

export { getSocket };

export const initializeSocket = (token) => {
  return getSocket();
};

export const joinDiscussion = (discussionId) => {
  const s = getSocket();
  if (s) s.emit('join-discussion', { discussionId });
};

export const leaveDiscussion = (discussionId) => {
  const s = getSocket();
  if (s) s.emit('leave-discussion', { discussionId });
};

export const emitTyping = (discussionId) => {
  const s = getSocket();
  if (s) s.emit('typing', { discussionId });
};

export const emitStopTyping = (discussionId) => {
  const s = getSocket();
  if (s) s.emit('stop-typing', { discussionId });
};
