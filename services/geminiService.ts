
import { GoogleGenAI } from "@google/genai";
import { User, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and will not be used in the final environment.
  // In a real deployed app, the environment variable should be set.
  console.warn("API_KEY is not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getFengShuiPrompt = (user: User): string => {
    let prompt = `Bạn là một chuyên gia phong thủy Việt Nam chuyên sâu về trang sức vàng. Hãy đưa ra lời khuyên cho khách hàng dựa trên thông tin sau. Phân tích mệnh, tuổi, và các yếu tố tương sinh, tương khắc để gợi ý loại vàng, kiểu dáng, và họa tiết trang sức phù hợp nhất để mang lại may mắn, tài lộc, và hạnh phúc. Viết bằng tiếng Việt, giọng văn trang trọng và am hiểu.\n\n`;
    
    prompt += `**Thông tin khách hàng:**\n`;
    prompt += `- **Họ và tên:** ${user.primary.name}\n`;
    prompt += `- **Ngày tháng năm sinh:** ${user.primary.dob}\n`;
    
    if (user.purchaseType === 'wedding' && user.partner) {
        prompt += `\n**Thông tin người phối ngẫu (vợ/chồng):**\n`;
        prompt += `- **Họ và tên:** ${user.partner.name}\n`;
        prompt += `- **Ngày tháng năm sinh:** ${user.partner.dob}\n\n`;
        prompt += `Đây là trang sức cưới, hãy tư vấn để hòa hợp cho cả hai vợ chồng.`;
    } else {
        prompt += `Đây là trang sức mua cho cá nhân.`;
    }

    return prompt;
};

export const getInitialAdvice = async (user: User): Promise<string> => {
  try {
    const prompt = getFengShuiPrompt(user);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting initial advice from Gemini:", error);
    return "Rất tiếc, đã có lỗi xảy ra khi kết nối với trợ lý AI. Vui lòng thử lại sau.";
  }
};


export const continueConversation = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const contents = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        
        contents.push({ role: 'user', parts: [{ text: newMessage }] });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents
        });
        return response.text;
    } catch (error) {
        console.error("Error continuing conversation with Gemini:", error);
        return "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.";
    }
};
