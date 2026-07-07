/**
 * FAQ knowledge base for the chatbot.
 * Each topic key matches an entry in the Dialogflow `faq_topic` entity.
 * Dialogflow only detects the intent + topic; the actual answer text lives
 * here so it can be edited without redeploying the agent.
 *
 * Shape per topic:
 *   { en: { answer, action? }, vi: { answer, action? } }
 * where `action` (optional) is a { type:"link", url, label } button.
 */
export const FAQ_TOPICS = {
  payment: {
    en: {
      answer:
        "We accept MoMo and VNPay for course payments. Free courses can be enrolled instantly without payment. Your purchase is confirmed automatically once the payment gateway completes.",
    },
    vi: {
      answer:
        "Chúng tôi hỗ trợ thanh toán qua MoMo và VNPay. Khóa học miễn phí có thể đăng ký ngay mà không cần thanh toán. Đơn hàng được xác nhận tự động sau khi cổng thanh toán hoàn tất.",
    },
  },

  certificate: {
    en: {
      answer:
        "Complete all lectures in a course to unlock its certificate. You can then issue and view it from your Certificates page, and share the public verification link with anyone.",
      action: { type: "link", url: "/student/certificates", label: "My Certificates" },
    },
    vi: {
      answer:
        "Hoàn thành tất cả bài giảng trong khóa học để mở khóa chứng chỉ. Sau đó bạn có thể cấp và xem chứng chỉ trong trang Chứng chỉ, và chia sẻ link xác minh công khai cho bất kỳ ai.",
      action: { type: "link", url: "/student/certificates", label: "Chứng chỉ của tôi" },
    },
  },

  become_instructor: {
    en: {
      answer:
        "Any student can apply to become an instructor. Submit your instructor application, and once an admin approves it you'll be able to create and publish your own courses.",
      action: { type: "link", url: "/student/become-instructor", label: "Become an Instructor" },
    },
    vi: {
      answer:
        "Bất kỳ học viên nào cũng có thể đăng ký trở thành giảng viên. Hãy gửi đơn đăng ký; sau khi quản trị viên duyệt, bạn có thể tạo và đăng khóa học của riêng mình.",
      action: { type: "link", url: "/student/become-instructor", label: "Trở thành giảng viên" },
    },
  },

  enroll: {
    en: {
      answer:
        "To enroll, open a course you like and add it to your cart, then check out. Free courses enroll instantly. After enrolling, the course appears under My Courses so you can start learning.",
      action: { type: "link", url: "/courses", label: "Browse Courses" },
    },
    vi: {
      answer:
        "Để đăng ký, mở khóa học bạn thích, thêm vào giỏ hàng rồi thanh toán. Khóa học miễn phí sẽ đăng ký ngay lập tức. Sau khi đăng ký, khóa học sẽ xuất hiện trong Khóa học của tôi để bạn bắt đầu học.",
      action: { type: "link", url: "/courses", label: "Xem khóa học" },
    },
  },
};

/**
 * Keyword → topic map for backend-side topic detection.
 * Dialogflow ES entity extraction on imported agents is unreliable, so we infer
 * the FAQ topic from the raw message here instead of trusting `@faq_topic`.
 * Order matters: the first topic with a matching keyword wins.
 */
export const FAQ_KEYWORDS = {
  payment: ["payment", "pay ", "momo", "vnpay", "thanh toán", "trả tiền", "thanh toan"],
  certificate: ["certificate", "certification", "chứng chỉ", "chung chi"],
  become_instructor: [
    "become an instructor", "instructor", "teach", "teaching",
    "giảng viên", "giang vien", "dạy học", "day hoc",
  ],
  enroll: [
    "enroll", "enrol", "sign up", "register for", "start learning",
    "đăng ký", "dang ky", "ghi danh", "bắt đầu học",
  ],
};

/**
 * Fallback answer when the FAQ intent fires but the topic is missing/unknown.
 */
export const FAQ_FALLBACK = {
  en: "I can help with payments, certificates, enrolling, and becoming an instructor. Which one would you like to know about?",
  vi: "Tôi có thể giúp về thanh toán, chứng chỉ, cách đăng ký học và cách trở thành giảng viên. Bạn muốn tìm hiểu về mục nào?",
};
