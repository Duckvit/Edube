import { create } from "zustand";
import { chatWithAi, summarizeCourse } from "../apis/AiService";
import { useUserStore } from "./useUserStore";

let idCounter = 1;

export const useAiStore = create((set, get) => ({
  visible: false,
  messages: [], // { id, sender: 'user'|'ai', text }
  loading: false,

  open: () => set({ visible: true }),
  close: () => set({ visible: false }),

  pushMessage: (msg) => {
    const m = { id: idCounter++, ...msg };
    set((s) => ({ messages: [...s.messages, m] }));
    return m;
  },

  // send a user message to AI, push user message then call API and push AI reply
  sendUserMessage: async (text) => {
    const learnerId = useUserStore.getState().userData?.id || 1;
    get().pushMessage({ sender: "user", text });
    // set loading so UI can show typing indicator
    set({ loading: true });
    try {
      const body = {
        userMessage: text,
        aiChatSession: { learner: { id: learnerId } },
      };
      const res = await chatWithAi(body);
      // res expected { statusCode, message, chatMessage: { message: '...' } }
      const aiText = res?.chatMessage?.message || res?.message || "No response";
      get().pushMessage({ sender: "ai", text: aiText });
      return res;
    } catch (err) {
      const errText = "AI service error";
      get().pushMessage({ sender: "ai", text: errText });
      console.error("AI chat error", err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  // request a course summarize and push AI response
  // accepts courseId and optional courseTitle so UI shows the course name
  summarizeCourseAndShow: async (courseId, courseTitle) => {
    const learnerId = useUserStore.getState().userData?.id || 1;
    get().open();
    const titleText = courseTitle || courseId;
    get().pushMessage({
      sender: "user",
      text: `Tóm tắt khoá học ${titleText}`,
    });
    // show loading indicator for summarization as well
    set({ loading: true });
    try {
      const res = await summarizeCourse(courseId, learnerId);
      // expected shape: { statusCode: 200, message: '...', data: { summaryContent } }
      const aiText =
        res?.data?.summaryContent || res?.message || "No summary available";
      get().pushMessage({ sender: "ai", text: aiText });
      return res;
    } catch (err) {
      get().pushMessage({ sender: "ai", text: "Failed to summarize course" });
      console.error("summarize error", err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useAiStore;
