import React, { useState } from "react";
import { conversations } from "../../utils/mockData";
import { Search } from "lucide-react";

export const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const getUnreadCount = (conversation) =>
    conversation.messages.filter((msg) => !msg.isRead).length;

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const updatedChat = {
      ...selectedChat,
      messages: [
        ...selectedChat.messages,
        {
          id: Date.now(),
          sender: "You",
          text: newMessage,
          time: "Just now",
          isRead: true,
        },
      ],
    };

    setSelectedChat(updatedChat);
    setNewMessage("");
  };

  return (
    <div className="space-y-6 m-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.map((chat) => (
              <div
                key={chat.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {chat.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {chat.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.messages[chat.messages.length - 1].text}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{chat.time}</p>
                    {getUnreadCount(chat) > 0 && (
                      <span className="inline-block w-5 h-5 bg-red-500 text-white text-xs rounded-full text-center leading-5 mt-1">
                        {getUnreadCount(chat)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-100px)]">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedChat.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedChat.name}
                    </p>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {selectedChat.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start space-x-3 ${
                      m.sender === "You" ? "justify-end" : ""
                    }`}
                  >
                    {m.sender !== "You" && (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {m.sender.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-xs ${
                        m.sender === "You"
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{m.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          m.sender === "You"
                            ? "text-purple-200"
                            : "text-gray-500"
                        }`}
                      >
                        {m.time}
                      </p>
                    </div>
                    {m.sender === "You" && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                        You
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
