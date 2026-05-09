import { getLastLearningProgress } from "#modules/learning/learning.service.js";
import { sendMessageToDialogflow } from "#services/dialogflow.service.js";
import { INTENT, PAGE_MAP } from "./chatbot.config.js";
import * as chatbotUtils from "./chatbot.utils.js";

export const handleChatbotResponse = async (
  user,
  { sessId, userMessage, languageCode = "en" }
) => {
  const isVi = languageCode === "vi";

  const userId = user?.userId;
  const userRole = user?.role || "guest";

  // call Dialogflow
  const response = await sendMessageToDialogflow(userMessage, sessId, languageCode);

  // get default text response
  let botReply = chatbotUtils.getBotText(response, languageCode);
  let actionData = null;

  // process custom payload
  if (response.fulfillmentMessages) {
    const payloadMsg = response.fulfillmentMessages.find(msg => msg.payload);

    if (payloadMsg) {
      const payload = chatbotUtils.protoToJSON(payloadMsg.payload);

      // course search intent
      if (payload.type === INTENT.COURSE_SEARCH && payload.filters) {
        actionData = handleCourseSearch(payload.filters);
      }

      // page navigation intent
      else if (payload.type === INTENT.PAGE_NAVIGATION && payload.navigation) {
        const result = handlePageNavigation(
          payload.navigation, userRole, languageCode
        );

        if (result.actionData) actionData = result.actionData;
        if (result.replyOverride) botReply = result.replyOverride;
      }

      else if (payload.type === INTENT.LEARNING_PROGRESS) {
        // check if user logged in
        if (!userId) {
          botReply = languageCode === "vi"
            ? "Bạn cần đăng nhập để theo dõi tiến độ học tập."
            : "You need to be logged in to track your learning progress.";

          actionData = {
            type: "redirect",
            url: "/auth/sign-in?redirectTo=%2Fstudent%2Fcourses",
            label: languageCode === "vi" ? "Đăng nhập" : "Sign In"
          };
        }

        // check if user is a student
        else if (user.role !== "student") {
          botReply = isVi
            ? `Tính năng này chỉ dành cho học viên. Bạn đang đăng nhập với vai trò là ${user.role}.`
            : `This feature is only for students. You are currently logged in as a ${user.role}.`;

          actionData = null;  // no action needed, just the message
        }

        // valid student
        else {
          const latestProgress = await getLastLearningProgress(userId);
          const result = handleLearningProgress(latestProgress, languageCode);

          if (result.actionData) actionData = result.actionData;
          if (result.replyOverride) botReply = result.replyOverride;  // overide Dialogflow's response
        }
      }
    }
  }

  return {
    reply: botReply,
    action: actionData
  };
};

/**
 * Handles logic for Course Search intent
 * @param {Object} filters
 */
export const handleCourseSearch = (filters) => {
  const params = new URLSearchParams();

  // helper: clean up search keyword
  const cleanSearchQuery = (val) => {
    if (!val) return null;

    // If Array, just join with space
    if (Array.isArray(val)) return val.join(' ');

    let str = val.toString();

    // Replace " and " with space
    str = str.replace(/\s+and\s+/gi, ' ');

    // Replace commas with space
    str = str.replace(/,/g, ' ');

    // Replace double spaces with single space and trim
    return str.replace(/\s+/g, ' ').trim();
  };

  // helper: clean up NLP artifacts from the "array" strings
  const getFirstValue = (val) => {
    if (!val) return null;

    // if array: take first element
    if (Array.isArray(val)) {
      return val.length > 0 ? val[0] : null;
    }

    // if String: split by separators and take the first chunk
    const stringVal = val.toString();
    const parts = stringVal.split(/,|\s+and\s+/i);

    return parts[0].trim();
  };

  // take all values ---
  // search
  const searchVal = cleanSearchQuery(filters.search);
  if (searchVal) params.append("search", searchVal);

  // take first value only ---
  // price
  const priceVal = getFirstValue(filters.price);
  if (priceVal) params.append("price", priceVal);

  // level
  const levelVal = getFirstValue(filters.level);
  if (levelVal) params.append("level", levelVal);

  // language
  const langVal = getFirstValue(filters.language);
  if (langVal) params.append("language", langVal);

  // sort
  const sortVal = getFirstValue(filters.sort);
  if (sortVal) params.append("sort", sortVal);

  return {
    type: "link", // manual click required
    url: `/courses?${params.toString()}`,
    label: ""
  };
};

/**
 * Handles logic for Page Navigation intent
 * @param {Object} navigationPayload
 * @param {String|null} userRole
 * @param {String} languageCode - "en" or "vi"
 */
export const handlePageNavigation = (navigationPayload, userRole, languageCode = "en") => {
  const { page, actor } = navigationPayload;
  const isVi = languageCode === "vi";

  // normalize page name (my-courses, my_courses -> my courses)
  const normalPageName = chatbotUtils.toNormalText(page);

  // normalize page key (my courses, )
  const pageKey = page ? page.toLowerCase().trim().replace(/[\s-]+/g, "_") : "";

  // check if empty
  if (!pageKey) {
    return {
      actionData: null,
      replyOverride: isVi
        ? `Nếu bạn muốn tôi chuyển trang, vui lòng nói rõ trang nào nhé!`
        : `If you want me to navigate you to a page, please specify which page it is!`,
    };
  }

  // check if page exist
  if (!PAGE_MAP[pageKey]) {
    return {
      actionData: null,
      replyOverride: isVi
        ? `Xin lỗi, tôi không tìm thấy trang "${normalPageName}". Bạn có thể nói rõ hơn không?`
        : `Sorry, I don't recognize the page "${normalPageName}". Can you provide more details?`,
    };
  }

  const publicUrl = chatbotUtils.getPublicUrl(pageKey);
  const requestedRole = actor ? actor.toLowerCase() : null; // role, requested by guest/user
  const impliedRole = chatbotUtils.getSoleRole(PAGE_MAP[pageKey]);  // page unique to one role

  // GUEST ---
  if (!userRole || userRole.toLocaleLowerCase() === "guest") {
    // public pages
    if (publicUrl) {
      return {
        actionData: {
          type: "redirect",
          url: publicUrl,
          label: isVi ? `Đi đến ${normalPageName}` : `Go to ${normalPageName}`
        },
        replyOverride: isVi
          ? `Đang chuyển hướng bạn đến ${normalPageName}...`
          : `Navigating you to ${normalPageName}...`,
      };
    }

    // private pages ---
    let targetRedirectUrl = null;
    let targetRole = null;

    if (requestedRole) {
      // if "Go to student cart"
      targetRedirectUrl = chatbotUtils.getRoleBasedUrl(requestedRole, pageKey);
      targetRole = requestedRole;
    } else if (impliedRole) {
      // if "Go to cart" (eg. "Cart" is unique to only one role: student)
      targetRedirectUrl = chatbotUtils.getRoleBasedUrl(impliedRole, pageKey);
      targetRole = impliedRole;
    }

    // if destination url is identified
    if (targetRedirectUrl) {
      const loginUrl = `/auth/sign-in?redirectTo=${encodeURIComponent(targetRedirectUrl)}`;
      return {
        actionData: {
          type: "redirect",
          url: loginUrl,
          label: isVi ? "Đăng nhập" : "Sign In"
        },
        replyOverride: isVi
          ? `Bạn cần đăng nhập với tư cách ${targetRole} để xem ${normalPageName}. Đang chuyển đến trang đăng nhập...`
          : `You need to sign in as a ${targetRole} to view ${normalPageName}. Redirecting you to login...`,
      };
    }
    else {
      // if ambiguous page (eg."Dashboard" exists for many role, but user didn't specify which role)
      return {
        actionData: null,
        replyOverride: isVi
          ? `Bạn chưa đăng nhập. Bạn là học viên hay giảng viên? Vui lòng nói rõ (ví dụ: "Bảng điều khiển của học viên").`
          : `You haven't logged in yet. Are you a student or an instructor? Please specify (eg. "Student Dashboard").`,
      };
    }
  }

  // USER ---
  // public pages
  if (publicUrl) {
    return {
      actionData: {
        type: "redirect",
        url: publicUrl,
        label: isVi ? `Đi đến ${normalPageName}` : `Go to ${normalPageName}`
      },
      replyOverride: isVi
        ? `Đang chuyển hướng bạn đến ${normalPageName}...`
        : `Navigating you to ${normalPageName}...`,
    };
  }

  // if user want to access pages from other roles (actor role != user role)
  if (requestedRole && requestedRole !== userRole.toLowerCase()) {
    return {
      actionData: null,
      replyOverride: isVi
        ? `Truy cập bị từ chối. Bạn đang đăng nhập là ${userRole}, nhưng lại yêu cầu trang dành cho ${requestedRole}.`
        : `Access denied. You are logged in as a ${userRole}, but you asked for a page meant for ${requestedRole}s.`,
    };
  }

  // if user didn't provide role or when actor role = user role
  const targetUrl = chatbotUtils.getRoleBasedUrl(userRole, pageKey);

  if (targetUrl) {
    return {
      actionData: {
        type: "redirect",
        url: targetUrl,
        label: isVi ? `Đi đến ${normalPageName}` : `Go to ${normalPageName}`
      },
      replyOverride: isVi
        ? `Đang đến trang ${normalPageName} của bạn...`
        : `Navigating to your ${normalPageName}...`,
    };
  } else {
    // tell the user they can't access that page
    if (impliedRole && impliedRole !== userRole.toLowerCase()) {
      return {
        actionData: null,
        replyOverride: isVi
          ? `Trang "${normalPageName}" chỉ dành cho ${impliedRole}.`
          : `The "${normalPageName}" page is only available for ${impliedRole}s.`,
      };
    }

    // not found
    return {
      actionData: null,
      replyOverride: isVi
        ? `Tôi không tìm thấy trang "${normalPageName}" đối với loại tài khoản của bạn (${userRole}).`
        : `I couldn't find a "${normalPageName}" page for your account type (${userRole}).`,
    };
  }
};

/**
 * Handles logic for Learning Progress intent
 * @param {Object} latestProgress
 * @param {String} languageCode - "en" or "vi"
 */
export const handleLearningProgress = (latestProgress, languageCode = "en") => {
  const isVi = languageCode === "vi";

  // if user hasn't started any course
  if (!latestProgress || !latestProgress.courseId) {
    return {
      actionData: {
        type: "link",
        url: "/courses",
        label: isVi ? "Xem các khóa học" : "Browse Courses",
      },
      replyOverride: isVi
        ? "Bạn chưa tham gia khóa học nào. Bạn có muốn xem danh sách khóa học không?"
        : "You haven't enrolled in any courses yet. Would you like to check out our catalog?",
    };
  }

  const { courseId, courseTitle, curriculum, lastLectureId, completedCount } = latestProgress;
  let targetLectureId = lastLectureId;

  // if haven't start a lesson/lecture yet, return first lecture
  if (!targetLectureId) {
    if (curriculum && curriculum.length > 0 && curriculum[0].lectures.length > 0) {
      targetLectureId = curriculum[0].lectures[0]._id;
    }
  }

  // if can't find a valid lecture id (empty course), go to course details
  if (!targetLectureId) {
    return {
      actionData: {
        type: "redirect",
        url: `/student/courses/${courseId}`,
        label: isVi ? "Chuyển đến khóa Học" : "Go to Course",
      },
      replyOverride: isVi
        ? `Tôi tìm thấy khóa học "${courseTitle}" của bạn, nhưng không tìm thấy bài học nào.`
        : `I found your recent course "${courseTitle}", but I couldn't find a valid lecture to resume.`,
    };
  }

  // if successfully obtains all data
  const resumeUrl = `/courses/${courseId}/watch/${targetLectureId}`;

  return {
    actionData: {
      type: "redirect",
      url: resumeUrl,
      label: isVi ? "Tiếp tục học" : "Continue Learning",
      courseTitle: courseTitle,
      progress: completedCount
    },
    replyOverride: isVi
      ? `Chào mừng trở lại! Tiếp tục học khóa "${courseTitle}" nhé.`
      : `Welcome back! Resuming "${courseTitle}" where you left off.`,
  };
};
