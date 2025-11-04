import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Search, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessageRest,
} from "../../apis/ChatServices";
import { getProfile } from "../../apis/UserServices";
import { toast } from "react-toastify";
import { parseJwt } from "../../utils/jwt";
import { Card } from "antd";

export const Chat = ({ mentorId, courseId, onCreateConversation }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [client, setClient] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { userData, role } = useUserStore();
  const jwtToken = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const subscriptionsRef = useRef(new Map());
  const typingTimeoutRef = useRef(null);

  // Helper: Get current user ID
  const getCurrentUserId = () => {
    if (userData?.id) return Number(userData.id);
    if (jwtToken) {
      try {
        const decoded = parseJwt(jwtToken);
        if (decoded?.userId) return Number(decoded.userId);
      } catch (e) {
        console.warn("Failed to parse JWT:", e);
      }
    }
    return null;
  };

  // Helper: Check if message is from current user
  const isMessageFromCurrentUser = (msgSenderId, conversationData = null) => {
    const currentUserId = getCurrentUserId();
    if (msgSenderId === currentUserId) return true;
    if (userData?.learner?.id === msgSenderId) return true;
    if (userData?.mentor?.id === msgSenderId) return true;
    if (!conversationData) return false;
    return (
      (conversationData.learner?.id === msgSenderId &&
        userData?.learner?.id === msgSenderId) ||
      (conversationData.mentor?.id === msgSenderId &&
        userData?.mentor?.id === msgSenderId)
    );
  };

  // Helper: Get sender ID for message sending
  const getSenderId = () => {
    const currentUserId = getCurrentUserId();
    const normalizedRole = role?.toLowerCase();

    if (normalizedRole === "learner") {
      return (
        currentUserId || userData?.learner?.id || selectedChat?.learner?.id
      );
    }
    if (normalizedRole === "mentor") {
      return currentUserId || userData?.mentor?.id || selectedChat?.mentor?.id;
    }
    return (
      currentUserId || selectedChat?.learner?.id || selectedChat?.mentor?.id
    );
  };

  // Helper: Map conversation to UI format
  const mapConversation = (conv) => {
    const currentUserId = getCurrentUserId();
    const otherParticipant =
      conv.mentor?.user?.id === currentUserId
        ? conv.learner
        : conv.learner?.user?.id === currentUserId
        ? conv.mentor
        : role?.toLowerCase() === "learner"
        ? conv.mentor
        : conv.learner;

    const otherName =
      otherParticipant?.user?.fullName ||
      otherParticipant?.fullName ||
      otherParticipant?.user?.username ||
      otherParticipant?.username ||
      conv.title ||
      "Unknown User";

    const lastMessage = conv.messages?.[conv.messages.length - 1];

    return {
      id: conv.id,
      name: otherName,
      lastMessage: lastMessage?.message || "No messages yet",
      lastMessageTime: lastMessage?.createdAt
        ? new Date(lastMessage.createdAt).toLocaleTimeString()
        : conv.lastMessageAt
        ? new Date(conv.lastMessageAt).toLocaleTimeString()
        : "--",
      mentor: conv.mentor,
      learner: conv.learner,
      messages: [],
    };
  };

  // Helper: Sort messages by createdAt
  const sortMessages = (messages) => {
    return [...messages].sort((a, b) => {
      const aTime = a.createdAt || (a.id ? new Date(a.id) : new Date(0));
      const bTime = b.createdAt || (b.id ? new Date(b.id) : new Date(0));
      return aTime - bTime;
    });
  };

  // Helper: Filter conversations by search query
  const filterConversations = (conversationsList, query) => {
    if (!query || query.trim() === "") {
      return conversationsList;
    }
    const lowerQuery = query.toLowerCase().trim();
    return conversationsList.filter((chat) => {
      const nameMatch = chat.name?.toLowerCase().includes(lowerQuery);
      const lastMessageMatch = chat.lastMessage
        ?.toLowerCase()
        .includes(lowerQuery);
      return nameMatch || lastMessageMatch;
    });
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      if (!jwtToken) {
        toast.error("Please login to access chat");
        return;
      }

      const userId = getCurrentUserId();
      // if (!userId) {
      //   toast.warning("User information not found. Please refresh the page.");
      //   return;
      // }

      const response = await getConversations(userId, 0, 50);
      const conversationsList = response?.chatConversations || [];

      if (response?.statusCode === 204 || conversationsList.length === 0) {
        setConversations([]);
        return;
      }

      const mappedConversations = conversationsList.map(mapConversation);
      setConversations(mappedConversations);

      if (mentorId && onCreateConversation) {
        const existingConv = mappedConversations.find(
          (conv) => conv.mentor?.id === mentorId || conv.mentorId === mentorId
        );
        if (!existingConv) {
          onCreateConversation(mentorId, courseId);
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please login again.");
        localStorage.removeItem("token");
      } else {
        console.log(
          error.response?.data?.message || "Failed to load conversations"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Load messages for conversation
  const loadMessagesForConversation = async (conversationId) => {
    try {
      setLoadingMessages(true);
      if (!jwtToken) {
        toast.error("Please login to access chat");
        return;
      }

      const response = await getMessages(conversationId, 0, 100);
      const messagesList = response?.chatMessages || [];

      if (response?.statusCode === 204 || messagesList.length === 0) {
        setSelectedChat((prev) => ({ ...prev, messages: [] }));
        return;
      }

      const mappedMessages = messagesList.map((msg) => ({
        id: msg.id,
        sender: isMessageFromCurrentUser(msg.senderId, selectedChat)
          ? "You"
          : "Other",
        senderId: msg.senderId,
        text: msg.message || "",
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString()
          : new Date().toLocaleTimeString(),
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        isRead: msg.isRead !== false,
      }));

      setSelectedChat((prev) => ({
        ...prev,
        messages: sortMessages(mappedMessages),
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please login again.");
        localStorage.removeItem("token");
      } else {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (chat) => {
    setSelectedChat({ ...chat, messages: chat.messages || [] });
    if (!chat.messages || chat.messages.length === 0) {
      loadMessagesForConversation(chat.id);
    }
    if (client && connected && chat.id) {
      subscribeToConversation(chat.id);
    }
  };

  // Subscribe to conversation WebSocket topic
  const subscribeToConversation = (conversationId) => {
    if (!client || !connected) return;

    subscriptionsRef.current.forEach((sub, id) => {
      if (id !== conversationId) {
        sub.unsubscribe();
        subscriptionsRef.current.delete(id);
      }
    });

    if (!subscriptionsRef.current.has(conversationId)) {
      const destination = `/topic/conversation/${conversationId}`;
      const subscription = client.subscribe(destination, (msg) => {
        try {
          const response = JSON.parse(msg.body);
          const chatMessage = response?.chatMessage;
          if (!chatMessage) return;

          setSelectedChat((prev) => {
            if (prev && prev.id === conversationId) {
              const newMessage = {
                id: chatMessage.id || Date.now(),
                sender: isMessageFromCurrentUser(chatMessage.senderId, prev)
                  ? "You"
                  : "Other",
                senderId: chatMessage.senderId,
                text: chatMessage.message || "",
                time: chatMessage.createdAt
                  ? new Date(chatMessage.createdAt).toLocaleTimeString()
                  : new Date().toLocaleTimeString(),
                createdAt: chatMessage.createdAt
                  ? new Date(chatMessage.createdAt)
                  : new Date(),
                isRead: chatMessage.isRead !== false,
              };
              return {
                ...prev,
                messages: sortMessages([...prev.messages, newMessage]),
              };
            }
            return prev;
          });

          setConversations((prev) => {
            const updated = [...prev];
            const convIndex = updated.findIndex(
              (conv) => conv.id === conversationId
            );
            if (convIndex >= 0) {
              updated[convIndex] = {
                ...updated[convIndex],
                lastMessage: chatMessage.message || "",
                lastMessageTime: chatMessage.createdAt
                  ? new Date(chatMessage.createdAt).toLocaleTimeString()
                  : new Date().toLocaleTimeString(),
              };
            }
            return updated;
          });
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });

      subscriptionsRef.current.set(conversationId, subscription);
      console.log(`✅ Subscribed to conversation ${conversationId}`);
    }
  };

  // Send message
  // const sendMessage = async () => {
  //   if (!message.trim() || !selectedChat) return;

  //   const messageText = message.trim();
  //   const conversationId = selectedChat.id;
  //   const senderId = getSenderId();

  //   if (!senderId) {
  //     toast.error("User information not found");
  //     return;
  //   }

  //   const chatMessageDto = {
  //     senderId,
  //     message: messageText,
  //     conversation: { id: conversationId },
  //   };

  //   const tempMessage = {
  //     id: Date.now(),
  //     sender: "You",
  //     senderId,
  //     text: messageText,
  //     time: "Just now",
  //     createdAt: new Date(),
  //     isRead: false,
  //   };

  //   setSelectedChat((prev) => ({
  //     ...prev,
  //     messages: sortMessages([...prev.messages, tempMessage]),
  //   }));
  //   setMessage("");

  //   if (client && connected) {
  //     try {
  //       client.publish({
  //         destination: "/app/chat.send-message",
  //         body: JSON.stringify(chatMessageDto),
  //       });
  //     } catch (error) {
  //       console.error("WebSocket send error, trying REST API:", error);
  //       try {
  //         await sendMessageRest(conversationId, chatMessageDto);
  //       } catch (restError) {
  //         console.error("REST API send error:", restError);
  //         toast.error(
  //           restError?.response?.data?.message || "Failed to send message"
  //         );
  //         setSelectedChat((prev) => ({
  //           ...prev,
  //           messages: prev.messages.filter((msg) => msg.id !== tempMessage.id),
  //         }));
  //       }
  //     }
  //   } else {
  //     try {
  //       await sendMessageRest(conversationId, chatMessageDto);
  //     } catch (error) {
  //       console.error("REST API send error:", error);
  //       toast.error(error?.response?.data?.message || "Failed to send message");
  //       setSelectedChat((prev) => ({
  //         ...prev,
  //         messages: prev.messages.filter((msg) => msg.id !== tempMessage.id),
  //       }));
  //     }
  //   }
  // };

  const sendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!message.trim() || !selectedChat) return;

    const data = {
      senderId: userData?.id,
      message,
      conversation: { id: selectedChat.id },
    };

    try {
      const res = await sendMessageRest(selectedChat.id, token, data);

      // Thêm tin nhắn mới vào danh sách
      setSelectedChat((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          {
            id: res.id || Date.now(),
            text: message,
            sender: "You",
            time: new Date().toLocaleTimeString(),
          },
        ],
      }));

      setMessage("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // WebSocket connection
  useEffect(() => {
    if (!jwtToken) {
      console.warn("No JWT token found, skipping WebSocket connection");
      return;
    }

    const wsUrl = `http://localhost:8080/ws?token=${encodeURIComponent(
      jwtToken
    )}`;
    const socket = new SockJS(wsUrl);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: { Authorization: `Bearer ${jwtToken}` },
      onConnect: () => {
        setConnected(true);
        console.log("✅ Connected to WebSocket");
        if (selectedChat?.id) subscribeToConversation(selectedChat.id);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        setConnected(false);
        if (frame?.headers?.message && !frame.headers.message.includes("401")) {
          toast.error("WebSocket connection error");
        }
      },
      onDisconnect: () => {
        setConnected(false);
        console.log("WebSocket disconnected");
        subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
        subscriptionsRef.current.clear();
      },
      beforeConnect: () => {
        console.log("🔄 Attempting to connect WebSocket...");
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient) stompClient.deactivate();
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, [jwtToken]);

  // Subscribe when WebSocket connects and conversation is selected
  useEffect(() => {
    if (client && connected && selectedChat?.id) {
      subscribeToConversation(selectedChat.id);
    }
  }, [client, connected, selectedChat?.id]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!userData && jwtToken) {
        try {
          const decoded = parseJwt(jwtToken);
          if (decoded?.sub) {
            const profile = await getProfile(decoded.sub, jwtToken);
            if (profile?.user) {
              useUserStore.getState().setUserData(profile.user);
            }
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };
    loadUserData();
  }, [userData, jwtToken]);

  // Load conversations
  useEffect(() => {
    const timer = setTimeout(() => loadConversations(), 200);
    return () => clearTimeout(timer);
  }, [userData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="bg-gray-100 rounded-lg shadow-lg m-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Chat Messages
            </h1>
            <p className="text-gray-600 text-sm">
              Communicate with your mentors and learners
            </p>
          </div>
          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
            {connected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                connected ? "text-green-600" : "text-red-600"
              }`}
            >
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card title="Conversations">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              />
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Loading conversations...</p>
                </div>
              ) : (
                (() => {
                  const filteredConversations = filterConversations(
                    conversations,
                    searchQuery
                  );
                  return filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>
                        {searchQuery
                          ? "No conversations found"
                          : "No conversations yet"}
                      </p>
                      <p className="text-sm mt-2">
                        {searchQuery
                          ? "Try a different search term"
                          : "Start a conversation to begin chatting"}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedChat?.id === chat.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleSelectConversation(chat)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                              {chat.name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {chat.name || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {chat.lastMessage}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-xs text-gray-500">
                              {chat.lastMessageTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  );
                })()
              )}
            </div>
          </Card>

          {/* Chat Window */}
          <Card
            className="lg:col-span-2 flex flex-col"
            title={selectedChat?.name || "Select a conversation"}
          >
            {selectedChat ? (
              <div
                className="flex flex-col"
                style={{ height: "calc(100vh - 280px)" }}
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Loading messages...</p>
                    </div>
                  ) : selectedChat.messages?.length > 0 ? (
                    <>
                      {selectedChat.messages.map((msg, i) => (
                        <div
                          key={msg?.id || i}
                          className={`flex items-start gap-3 ${
                            msg.sender === "You" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
                              msg.sender === "You"
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : "bg-gradient-to-r from-blue-400 to-blue-500"
                            }`}
                          >
                            {msg.sender === "You"
                              ? "Y"
                              : selectedChat.name?.charAt(0) || "?"}
                          </div>
                          <div
                            className={`rounded-lg p-3 max-w-xs ${
                              msg.sender === "You"
                                ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.text}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.sender === "You"
                                  ? "text-green-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || !selectedChat}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ height: "calc(100vh - 280px)" }}
              >
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
