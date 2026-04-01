
export const toInstructorDetails = (instructor, timestamp = false) => {
  if (!instructor) return null;

  const skills = (instructor.skills || []).map(s => ({
    name: s.name,
    level: s.level
  })).filter(Boolean);

  const education = (instructor.education || []).map(e => ({
    fieldOfStudy: e.fieldOfStudy,
    institution: e.institution,
    addedAt: e.addedAt
  })).filter(Boolean);

  return {
    // insId: (instructor.user?._id || instructor.user)?.toString(),

    name: instructor.user?.name,
    email: instructor.user?.email,
    phonenumber: instructor.user?.phonenumber,
    avatar: instructor.user?.pfpImg,
    address: instructor.address,
    occupation: instructor.occupation,

    website: instructor.user?.website,
    socials: {
      facebook: instructor.user?.socials?.facebook,
      instagram: instructor.user?.socials?.instagram,
      linkedin: instructor.user?.socials?.linkedin,
      youtube: instructor.user?.socials?.youtube,
    },

    introduction: instructor.introduction,
    skills: skills,
    education: education,

    ...(timestamp && {
      createdAt: instructor.createdAt,
      updatedAt: instructor.updatedAt,
    }),

    isActive: instructor.user?.isActivated,
  };
};