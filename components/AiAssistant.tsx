
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { getInitialAdvice, continueConversation } from '../services/geminiService';
import { SendHorizonal, Bot, User as UserIcon } from 'lucide-react';

interface Props {
  user: User;
}

const AiAssistant: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    const fetchInitialAdvice = async () => {
      setIsLoading(true);
      const advice = await getInitialAdvice(user);
      setMessages([{ role: 'model', content: advice }]);
      setIsLoading(false);
    };
    fetchInitialAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const modelResponse = await continueConversation([...messages, userMessage], input);
    const aiMessage: ChatMessage = { role: 'model', content: modelResponse };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 flex flex-col h-full max-h-[80vh]">
      <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">AI Tư vấn Phong thủy</h3>
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center"><Bot size={20} /></div>}
            <div className={`max-w-xs md:max-w-sm lg:max-w-md rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-800 text-white' : 'bg-gray-700 text-yellow-50'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon size={20} /></div>}
          </div>
        ))}
        {isLoading && (
            <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center"><Bot size={20} /></div>
                <div className="rounded-lg p-3 bg-gray-700 text-yellow-50">
                    <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-0"></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-150"></span>
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Hỏi thêm về phong thủy..."
          className="flex-grow bg-gray-700 p-2 rounded-l-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-yellow-600 text-white p-2 rounded-r-md hover:bg-yellow-700 disabled:bg-gray-500"
        >
          <SendHorizonal size={24} />
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
