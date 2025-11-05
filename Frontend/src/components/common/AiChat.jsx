import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import useAiStore from "../../store/useAiStore";

export default function AiChat() {
  const visible = useAiStore((s) => s.visible);
  const messages = useAiStore((s) => s.messages);
  const open = useAiStore((s) => s.open);
  const close = useAiStore((s) => s.close);
  const pushMessage = useAiStore((s) => s.pushMessage);
  const sendUserMessage = useAiStore((s) => s.sendUserMessage);
  const summarizeCourseAndShow = useAiStore((s) => s.summarizeCourseAndShow);

  const [inputValue, setInputValue] = useState("");
  const isTyping = useAiStore((s) => s.loading);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      pushMessage({
        sender: "ai",
        text: "Xin chào! Tôi là trợ lý AI của Edube. Hãy hỏi tôi về khóa học hoặc giúp đỡ.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    const trimmed = (inputValue || "").trim();
    if (!trimmed) return;
    setInputValue("");
    try {
      await sendUserMessage(trimmed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const fabStyle = {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 999,
  };

  return (
    <>
      {!visible && (
        <button onClick={() => open()} style={fabStyle} className="group">
          <div
            className="rounded-full p-4 shadow-lg"
            style={{ background: "linear-gradient(90deg,#0ea5e9,#f59e0b)" }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
        </button>
      )}

      {visible && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            width: 380,
            height: 640,
            zIndex: 1000,
          }}
        >
          <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: "linear-gradient(90deg,#0ea5e9,#f59e0b)" }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Trợ lý AI</h3>
                  <p className="text-xs text-blue-50">Luôn sẵn sàng hỗ trợ</p>
                </div>
              </div>
              <button
                onClick={() => close()}
                className="rounded-full p-1 hover:bg-white/20"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "user"
                        ? "bg-gradient-to-br from-green-400 to-green-500"
                        : "bg-gradient-to-br from-blue-400 to-blue-500"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-green-400 to-green-400 text-white rounded-tr-sm"
                        : "bg-white text-gray-800 shadow-sm rounded-tl-sm border border-gray-100"
                    }`}
                  >
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {message.text}
                    </pre>
                    <div className="text-xs mt-1 text-gray-400">
                      {new Date(
                        message.timestamp || Date.now()
                      ).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-blue-500 to-yellow-500 text-white rounded-full p-3 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
