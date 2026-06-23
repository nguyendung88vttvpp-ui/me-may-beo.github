// Cấu hình API (Thay API Key của bạn vào đây)
const API_KEY = "AQ.Ab8RN6I4Ku7kv-YZv3maW0jKCKdsoNYBhKlM6E7EGuzPgn48Sw"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Hàm tạo giao diện tin nhắn mới
function appendMessage(sender, text, isBot = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-start space-x-4 border-b border-[#21262d] pb-4 ${isBot ? '' : 'bg-[#161b22]/30 p-2 rounded-lg'}`;

    const avatar = isBot 
        ? `<div class="w-8 h-8 rounded-md bg-[#238636] flex items-center justify-center text-white font-bold shrink-0">W</div>`
        : `<div class="w-8 h-8 rounded-md bg-[#8b949e] flex items-center justify-center text-black font-bold shrink-0">U</div>`;

    msgDiv.innerHTML = `
        ${avatar}
        <div class="flex-1 space-y-1">
            <div class="flex items-center space-x-2">
                <span class="font-bold text-white text-sm">${sender}</span>
                <span class="text-xs text-[#8b949e]">${isBot ? 'bot' : 'user'}</span>
            </div>
            <div class="text-sm text-[#c9d1d9] whitespace-pre-wrap whitespace-normal leading-relaxed font-mono">${escapeHtml(text)}</div>
        </div>
    `;
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Cuộn xuống cuối
}

// Tránh lỗi XSS bảo mật khi render text
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Hàm gửi dữ liệu lên AI
async function handleSendMessage() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    // Hiển thị tin nhắn của User
    appendMessage("You", prompt, false);
    userInput.value = ""; // Xóa ô input
    
    // Trạng thái Loading giả lập
    sendBtn.disabled = true;
    const loadingDiv = document.createElement('div');
    loadingDiv.className = "text-xs text-[#8b949e] italic animate-pulse";
    loadingDiv.innerText = "WornGPT đang suy nghĩ...";
    chatContainer.appendChild(loadingDiv);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Bạn là WornGPT, một trợ lý lập trình thông minh được tích hợp trong GitHub. Hãy trả lời câu hỏi sau một cách chuyên nghiệp ngắn gọn: ${prompt}` }] }]
            })
        });

        const data = await response.json();
        chatContainer.removeChild(loadingDiv); // Xóa loading

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const botResponse = data.candidates[0].content.parts[0].text;
            appendMessage("WornGPT", botResponse, true);
        } else {
            appendMessage("WornGPT", "Lỗi: Không thể lấy phản hồi từ hệ thống.", true);
        }

    } catch (error) {
        if(chatContainer.contains(loadingDiv)) chatContainer.removeChild(loadingDiv);
        appendMessage("WornGPT", "Mất kết nối mạng hoặc lỗi API Key.", true);
        console.error(error);
    } finally {
        sendBtn.disabled = false;
    }
}

// Bắt sự kiện Click nút gửi
sendBtn.addEventListener('click', handleSendMessage);

// Bắt sự kiện Enter (nhưng Shift+Enter thì xuống dòng)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});
