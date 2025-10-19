window.global = window;

import React, { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Search } from "lucide-react";

let stompClient = null;

export const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [client, setClient] = useState(null);
  const [conversations, setConversations] = useState([]);

  const jwtToken = localStorage.getItem("token");

  useEffect(() => {
    // Initialize empty conversations
    setConversations([]);
  }, []);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setConnected(true);
        console.log("✅ Connected to WebSocket");

        // Subscribe to public messages
        stompClient.subscribe("/topic/public", (msg) => {
          const payload = JSON.parse(msg.body);
          console.log("📩 Received:", payload);
          
          // Add message to selected chat if it matches
          if (selectedChat) {
            setSelectedChat(prev => ({
              ...prev,
              messages: [...prev.messages, {
                id: Date.now(),
                sender: payload.sender,
                text: payload.content,
                time: new Date().toLocaleTimeString(),
                isRead: true
              }]
            }));
          }
        });

        // Subscribe to private messages
        stompClient.subscribe(`/user/${jwtToken}/queue/messages`, (msg) => {
          const payload = JSON.parse(msg.body);
          console.log("📩 Private message received:", payload);
          
          // Handle private message
          handlePrivateMessage(payload);
        });

        // Subscribe to conversation updates
        stompClient.subscribe("/topic/conversations", (msg) => {
          const payload = JSON.parse(msg.body);
          console.log("📩 Conversation update:", payload);
          
          // Update conversations list
          setConversations(prev => {
            const existing = prev.find(conv => conv.id === payload.id);
            if (existing) {
              return prev.map(conv => 
                conv.id === payload.id 
                  ? { ...conv, ...payload }
                  : conv
              );
            } else {
              return [...prev, payload];
            }
          });
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setConnected(false);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [selectedChat, jwtToken]);

  const handlePrivateMessage = (payload) => {
    // Handle private message logic
    if (selectedChat && selectedChat.id === payload.conversationId) {
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: Date.now(),
          sender: payload.sender,
          text: payload.content,
          time: new Date().toLocaleTimeString(),
          isRead: true
        }]
      }));
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !client || !connected || !selectedChat) return;

    const chatMessage = {
      sender: jwtToken || "anonymous",
      content: message,
      conversationId: selectedChat.id,
      timestamp: new Date().toISOString()
    };

    // Send via WebSocket
    client.publish({
      destination: "/app/chat.send-message",
      body: JSON.stringify(chatMessage),
    });

    // Add to local state immediately for better UX
    setSelectedChat(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: Date.now(),
        sender: "You",
        text: message,
        time: "Just now",
        isRead: true
      }]
    }));

    setMessage("");
  };

  const getUnreadCount = (conversation) =>
    conversation.messages.filter((msg) => !msg.isRead).length;


  return (
    <div className="space-y-6 m-2">
      {/* Connection Status */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Real-time Chat</h3>
            <p className="text-sm text-gray-500">WebSocket Connection</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

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
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Start a conversation to begin chatting</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {chat.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {chat.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{chat.lastMessageTime || '--'}</p>
                      {getUnreadCount(chat) > 0 && (
                        <span className="inline-block w-5 h-5 bg-red-500 text-white text-xs rounded-full text-center leading-5 mt-1">
                          {getUnreadCount(chat)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
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
                    {selectedChat.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedChat.name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {selectedChat.messages && selectedChat.messages.length > 0 ? (
                  selectedChat.messages.map((msg, i) => (
                    <div
                      key={msg?.id || i}
                      className={`flex items-start space-x-3 ${
                        msg.sender === "You" ? "justify-end" : ""
                      }`}
                    >
                      {msg?.sender !== "You" && (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {msg?.sender?.charAt(0) || '?'}
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 max-w-xs ${
                          msg?.sender === "You"
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg?.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg?.sender === "You"
                              ? "text-purple-200"
                              : "text-gray-500"
                          }`}
                        >
                          {msg?.time}
                        </p>
                      </div>
                      {msg?.sender === "You" && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                          You
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!connected || !message.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connected ? "Send" : "Connecting..."}
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
