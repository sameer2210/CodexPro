import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import axiosClient from '../../utils/axiosClient';

const Chat = ({ discussionId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChatMessages = async () => {
      if (!discussionId) return;
      try {
        setLoading(true);
        const response = await axiosClient.get(`/discussions/${discussionId}`);
        if (response.data?.discussion?.comments) {
          setMessages(response.data.discussion.comments);
        }
      } catch (err) {
        console.warn('Failed to load chat comments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChatMessages();
  }, [discussionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !discussionId) return;

    const newMessage = {
      _id: Date.now().toString(),
      content: input.trim(),
      author: {
        firstName: user?.firstName || user?.username || 'You',
        lastName: user?.lastName || '',
      },
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentInput = input;
    setInput('');

    try {
      await axiosClient.post(`/discussions/${discussionId}/comments`, {
        content: currentInput.trim(),
      });
    } catch (err) {
      console.warn('Failed to send comment:', err);
    }
  };

  return (
    <div className="flex flex-col h-[450px] bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
        <MessageSquare className="w-5 h-5 text-orange-400" />
        <span className="font-semibold text-white text-sm">Discussion Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">No messages yet. Be the first to start the chat!</div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg._id || index} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-orange-400">
                  {msg.author?.firstName ? `${msg.author.firstName} ${msg.author.lastName || ''}`.trim() : 'Anonymous'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-200 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-slate-800/90 border-t border-slate-700/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-slate-900/90 border border-slate-700 text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
