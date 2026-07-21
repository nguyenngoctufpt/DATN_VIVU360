// Cấu hình API Key cho các dịch vụ AI
// ⚠️ Không chia sẻ file này public. Thêm vào .gitignore nếu cần.

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Gemini API endpoint
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Gọi Gemini AI để tạo gợi ý du lịch
 * @param {string} prompt - Câu hỏi / yêu cầu từ người dùng
 * @returns {Promise<string>} - Phản hồi từ AI
 */
export async function askGeminiAI(prompt) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Bạn là trợ lý du lịch Việt Nam chuyên nghiệp cho ứng dụng Vivu360. Hãy trả lời bằng tiếng Việt, ngắn gọn, thực tế và hữu ích. Sử dụng emoji phù hợp.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.log('Gemini API error:', response.status, errData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Không nhận được phản hồi từ AI');
    return text;
  } catch (error) {
    console.log('Gemini AI error:', error);
    throw error;
  }
}

/**
 * Gợi ý lịch trình du lịch từ AI
 * @param {string} destination - Điểm đến
 * @param {number} days - Số ngày
 * @returns {Promise<string>}
 */
export async function suggestItinerary(destination, days = 3) {
  const prompt = `Lên lịch trình du lịch ${destination} trong ${days} ngày. Mỗi ngày ghi rõ: sáng, trưa, chiều, tối nên đi đâu, ăn gì, lưu ý gì. Format ngắn gọn dạng bullet points.`;
  return askGeminiAI(prompt);
}

/**
 * Gợi ý đồ dùng mang theo
 * @param {string} destination - Điểm đến
 * @param {string} tripType - Loại chuyến đi (biển, núi, thành phố...)
 * @returns {Promise<string>}
 */
export async function suggestPackingList(destination, tripType = '') {
  const prompt = `Gợi ý danh sách đồ dùng cần mang theo khi đi du lịch ${destination}${tripType ? ` (loại hình: ${tripType})` : ''}. Phân loại: Bắt buộc, Quan trọng, Nên mang. Mỗi mục ghi emoji + tên đồ.`;
  return askGeminiAI(prompt);
}
