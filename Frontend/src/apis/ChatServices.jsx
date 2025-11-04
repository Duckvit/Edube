import axiosConfig from "../axiosConfig";

/**
 * Lấy token từ localStorage
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Tạo conversation mới giữa learner và mentor
 * @param {Object} chatConversationDto - { learner: { id }, mentor: { id } }
 * @returns {Promise} Response từ server
 */
export const createConversation = async (chatConversationDto) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await axiosConfig.post(
    `/api/chat/conversation`,
    chatConversationDto,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Lấy danh sách conversations của user
 * @param {Number} participantId - ID của learner hoặc mentor (learner_id hoặc mentor_id)
 * @param {Number} page - Số trang (default: 0)
 * @param {Number} size - Số items mỗi trang (default: 10)
 * @returns {Promise} Response chứa danh sách conversations
 */
export const getConversations = async (participantId, page = 0, size = 10) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Backend đã được cập nhật để hỗ trợ participantId (learner_id hoặc mentor_id)
  // Đảm bảo participantId là Integer
  const participantIdInteger =
    typeof participantId === "string"
      ? parseInt(participantId, 10)
      : participantId;
  if (isNaN(participantIdInteger) || !Number.isInteger(participantIdInteger)) {
    throw new Error(
      `Invalid participantId: ${participantId}. Expected Integer.`
    );
  }

  const res = await axiosConfig.post(
    `/api/chat/conversations`,
    {
      participantId: participantIdInteger, // Gửi participantId thay vì userId
      page: Number(page) || 0,
      size: Number(size) || 10,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Lấy messages của một conversation
 * @param {Number} conversationId - ID của conversation
 * @param {Number} page - Số trang (default: 0)
 * @param {Number} size - Số items mỗi trang (default: 50)
 * @returns {Promise} Response chứa danh sách messages
 */
export const getMessages = async (conversationId, page = 0, size = 50) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // Backend đã đổi sang @PostMapping - dùng POST
  // Đảm bảo conversationId là Integer
  const conversationIdInteger =
    typeof conversationId === "string"
      ? parseInt(conversationId, 10)
      : conversationId;
  if (
    isNaN(conversationIdInteger) ||
    !Number.isInteger(conversationIdInteger)
  ) {
    throw new Error(
      `Invalid conversationId: ${conversationId}. Expected Integer.`
    );
  }

  const res = await axiosConfig.post(
    `/api/chat/messages`,
    {
      conversationId: conversationIdInteger,
      page: Number(page) || 0,
      size: Number(size) || 50,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

/**
 * Gửi message qua REST API (fallback nếu WebSocket fail)
 * @param {Number} conversationId - ID của conversation
 * @param {Object} chatMessageDto - { senderId, message, conversation: { id } }
 * @returns {Promise} Response từ server
 */
// export const sendMessageRest = async (conversationId, chatMessageDto) => {
//   const token = getToken();
//   if (!token) {
//     throw new Error("No authentication token found");
//   }

//   const res = await axiosConfig.post(
//     `/api/chat/message/${conversationId}`,
//     chatMessageDto,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   return res.data;
// };

export const sendMessageRest = async (conversationId, token, data) => {
  const res = await axiosConfig.post(
    `/api/chat/message/${conversationId}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export default {
  createConversation,
  getConversations,
  getMessages,
  sendMessageRest,
};
