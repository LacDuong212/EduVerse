
export const GUEST_CHAT_SESSION_ID = "EDV_gst_chat_id";
export const USER_CHAT_SESSION_ID = "EDV_usr_chat_id";
export const CHAT_LANGUAGE = "EDV_chat_lang"

// Quick-reply chips shown on the welcome screen. `query` is the text sent to
// the bot when a chip is clicked. Kept in sync with backend SUGGESTIONS.
export const WELCOME_SUGGESTIONS = {
  en: [
    { label: "Recommend courses", query: "Recommend some courses for me" },
    { label: "Payment methods", query: "What payment methods do you accept?" },
    { label: "Get a certificate", query: "How do I get a certificate?" },
    { label: "Become an instructor", query: "How do I become an instructor?" },
  ],
  vi: [
    { label: "Gợi ý khóa học", query: "Gợi ý vài khóa học cho tôi" },
    { label: "Cách thanh toán", query: "Có những phương thức thanh toán nào?" },
    { label: "Lấy chứng chỉ", query: "Làm sao để lấy chứng chỉ?" },
    { label: "Trở thành giảng viên", query: "Làm sao để trở thành giảng viên?" },
  ],
};
