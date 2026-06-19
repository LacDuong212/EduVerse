const toAuthorDto = (user) => {
  if (!user) return null;
  return {
    id: user._id?.toString(),
    name: user.name || null,
    avatar: user.pfpImg || null,
  };
};

export const toReplyDto = (qa, currentUserId = null) => {
  if (!qa) return null;
  return {
    id: qa._id?.toString(),
    content: qa.content,
    isInstructorPost: qa.isInstructorPost ?? false,
    isMyPost: currentUserId
      ? qa.author?._id?.toString() === currentUserId
      : false,
    author: toAuthorDto(qa.author),
    createdAt: qa.createdAt,
    updatedAt: qa.updatedAt,
  };
};

export const toQuestionDto = (qa, replies = [], currentUserId = null) => {
  if (!qa) return null;
  return {
    id: qa._id?.toString(),
    content: qa.content,
    lectureId: qa.lectureId || null,
    isInstructorPost: qa.isInstructorPost ?? false,
    isResolved: qa.isResolved ?? false,
    isMyPost: currentUserId
      ? qa.author?._id?.toString() === currentUserId
      : false,
    author: toAuthorDto(qa.author),
    replies: replies.map((r) => toReplyDto(r, currentUserId)),
    createdAt: qa.createdAt,
    updatedAt: qa.updatedAt,
  };
};
