import axiosConfig from "../axiosConfig";

// AI service wrapper. Follows same calling pattern as other services in /src/apis
export const chatWithAi = async (payload) => {
  // payload example: { userMessage: '...', aiChatSession: { learner: { id: 1 } } }
  const res = await axiosConfig.post("/api/ai/chat", payload);
  return res.data;
};

export const summarizeCourse = async (courseId, learnerId) => {
  // Backend expects POST to /api/ai/summarize/course/{courseId}?learnerId={learnerId}
  // with no request body. Build the URL with query param so it works for any learner.
  const url = `/api/ai/summarize/course/${courseId}?learnerId=${learnerId}`;
  const res = await axiosConfig.post(url);
  return res.data;
};

export default { chatWithAi, summarizeCourse };
