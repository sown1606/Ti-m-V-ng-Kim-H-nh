import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, Product, Category } from '../types';
import { SendHorizonal, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Cần cài đặt: npm install react-markdown

interface Props {
  user: User;
  categories: Category[]; // Nhận categories từ App.tsx
  onProductSelect: (product: Product) => void; // Nhận hàm thêm product từ App.tsx
}

const AI_CHAT_URL = `${import.meta.env.VITE_API_URL || 'http://ec2-18-189-20-60.us-east-2.compute.amazonaws.com:1337/api'}`.replace(/\/+$/, '') + '/ai/chat';

const AiAssistant: React.FC<Props> = ({ user, categories, onProductSelect }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<number | undefined>(undefined);
  const [hasSentIdleMessage, setHasSentIdleMessage] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Tìm sản phẩm theo ID (để dùng cho link clickable)
  const findProductById = (id: number): Product | null => {
    for (const category of categories) {
      const product = category.products.find((p) => p.id === id);
      if (product) return product;
    }
    return null;
  };

  // Hàm gọi API backend an toàn
  const callAiChat = async (body: any) => {
    try {
      const response = await fetch(AI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const raw = await response.text();

      if (!response.ok) {
        throw new Error('AI chat request failed');
      }

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('Cannot parse AI response JSON');
      }

      return data.text;
    } catch (error) {
      throw error;
    }
  };

  const initialCalledRef = useRef(false);
  // Lần đầu: gọi AI tư vấn theo thông tin user
  useEffect(() => {
    if (!user || initialCalledRef.current) return;
    initialCalledRef.current = true;

    const fetchInitialAdvice = async () => {
      setIsLoading(true);
      try {
        const advice = await callAiChat({ user }); // Gọi API backend
        setMessages([{ role: 'model', content: advice }]);
      } catch (e) {
        setMessages([
          { role: 'model', content: 'Lỗi: Không thể kết nối với Kim Hạnh II AI.' },
        ]);
      }
      setIsLoading(false);
    };

    if (user) {
      fetchInitialAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    if (!user) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Dùng history mới (bao gồm tin nhắn vừa gửi)
      const historyToSend = [...messages, userMessage];
      const modelResponse = await callAiChat({
        user,
        history: historyToSend,
        newMessage: input,
      });

      const aiMessage: ChatMessage = { role: 'model', content: modelResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Lỗi: Không thể nhận phản hồi.' },
      ]);
    }
    setIsLoading(false);
  };

  // Auto message hài hước sau 60s im lặng
  useEffect(() => {
    if (!user) return;
    if (isLoading) return;
  if (hasSentIdleMessage) return;
  if (messages.length === 0) return;

    if (idleTimerRef.current !== undefined) {
      window.clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content:
              'Hông hỏi nữa thì thôi em đi ngủ xíu nha 😴 Khi nào anh/chị cần tư vấn thêm cứ gọi em dậy liền.',
        },
      ]);
    setHasSentIdleMessage(true);
  }, 60000);

    return () => {
      if (idleTimerRef.current !== undefined) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [messages, user, isLoading, hasSentIdleMessage]);

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
      return (
          <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
          >
            {children}
          </a>
      );
    },
  };

  return (
      <div className="bg-slate-900/95 rounded-lg p-3 flex flex-col h-full shadow-2xl">
        <h3 className="text-lg font-bold text-yellow-300 mb-3 border-b border-slate-700 pb-2">
          Kim Hạnh 2 AI
        </h3>
        <div className="flex-grow overflow-y-auto pr-1 space-y-2">
          {messages.map((msg, index) => (
              <div
                  key={index}
                  className={`flex items-start gap-2 ${
                      msg.role === 'user' ? 'justify-end' : ''
                  }`}
              >
                {msg.role === 'model' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                      <Bot size={20} />
                    </div>
                )}
                <div
                    className={`max-w-[95%] rounded-lg px-2.5 py-2 text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === 'user'
                            ? 'bg-blue-800 text-white'
                            : 'bg-gray-700 text-yellow-50'
                    }`}
                >
                  <ReactMarkdown components={renderers}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <UserIcon size={20} />
                    </div>
                )}
              </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div className="max-w-xs md:max-w-sm lg:max-w-md rounded-lg p-3 bg-gray-700 text-yellow-50 italic">
                  Kim Hạnh II AI đang suy nghĩ cho anh/chị...
                </div>
              </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-3 flex">
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Hỏi thêm về phong thủy..."
              className="flex-grow bg-gray-800 p-2 rounded-l-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white text-sm"
              disabled={isLoading}
          />
          <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-yellow-600 text-white p-2 rounded-r-md hover:bg-yellow-700 disabled:bg-gray-500"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      </div>
  );
};

export default AiAssistant;
