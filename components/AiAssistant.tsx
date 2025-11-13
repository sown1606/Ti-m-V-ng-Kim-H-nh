import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, Product, Category } from '../types';
import { SendHorizonal, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Cần cài đặt: npm install react-markdown

interface Props {
  user: User;
  categories: Category[]; // Nhận categories từ App.tsx
  onProductSelect: (product: Product) => void; // Nhận hàm thêm product từ App.tsx
}

// URL của API backend an toàn
const AI_CHAT_URL = 'http://ec2-18-189-20-60.us-east-2.compute.amazonaws.com:1337/api/ai/chat';

const AiAssistant: React.FC<Props> = ({ user, categories, onProductSelect }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Tìm sản phẩm theo ID (để dùng cho link clickable)
  const findProductById = (id: number): Product | null => {
    for (const category of categories) {
      const product = category.products.find(p => p.id === id);
      if (product) return product;
    }
    return null;
  }

  // Hàm gọi API backend an toàn
  const callAiChat = async (body: any) => {
    const response = await fetch(AI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error('AI chat request failed');
    }
    const data = await response.json();
    return data.text;
  };

  useEffect(() => {
    const fetchInitialAdvice = async () => {
      setIsLoading(true);
      try {
        const advice = await callAiChat({ user }); // Gọi API backend
        setMessages([{ role: 'model', content: advice }]);
      } catch (e) {
        setMessages([{ role: 'model', content: 'Lỗi: Không thể kết nối với KimHanh_II AI.' }]);
      }
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

    try {
      const modelResponse = await callAiChat({ history: messages, newMessage: input });
      const aiMessage: ChatMessage = { role: 'model', content: modelResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: 'Lỗi: Không thể nhận phản hồi.' }]);
    }
    setIsLoading(false);
  };

  // Tùy chỉnh renderer cho Markdown
  const renderers = {
    // Ghi đè link (a)
    a: ({ href, children }: { href?: string; children: React.ReactNode }) => {
      if (href && href.startsWith('add-product:')) {
        const productId = parseInt(href.split(':')[1], 10);
        const product = findProductById(productId);

        if (product) {
          return (
              <button
                  className="text-yellow-400 font-bold underline hover:text-yellow-200"
                  onClick={() => onProductSelect(product)}
              >
                {children} (Thêm vào BST)
              </button>
          );
        }
      }
      // Link thường (nếu có)
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{children}</a>;
    }
  };

  return (
      <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 flex flex-col h-full max-h-[80vh]">
        <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">KimHanh_II AI</h3>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center"><Bot size={20} /></div>}
                <div className={`max-w-xs md:max-w-sm lg:max-w-md rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-800 text-white' : 'bg-gray-700 text-yellow-50'}`}>
                  {/* Dùng ReactMarkdown để render */}
                  <ReactMarkdown components={renderers}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon size={20} /></div>}
              </div>
          ))}
          {/* (Phần Loading... giữ nguyên) */}
          <div ref={messagesEndRef} />
        </div>
        {/* (Phần Input... giữ nguyên) */}
        <div className="mt-4 flex">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Hỏi thêm về phong thủy..." className="flex-grow bg-gray-700 p-2 rounded-l-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white" disabled={isLoading} />
          <button onClick={handleSend} disabled={isLoading} className="bg-yellow-600 text-white p-2 rounded-r-md hover:bg-yellow-700 disabled:bg-gray-500" >
            <SendHorizonal size={24} />
          </button>
        </div>
      </div>
  );
};

export default AiAssistant;
