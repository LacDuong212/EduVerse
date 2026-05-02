
export const toStudentProfileDto = (student) => {
  if (!student) return null;

  return {
    // stuId: (student.user?._id || student.user)?.toString(),

    name: student.user?.name,
    email: student.user?.email,
    phonenumber: student.user?.phonenumber,
    avatar: student.user?.pfpImg,
    bio: student.user?.bio,

    website: student.user?.website,
    socials: {
      facebook: student.user?.socials?.facebook,
      instagram: student.user?.socials?.instagram,
      linkedin: student.user?.socials?.linkedin,
      youtube: student.user?.socials?.youtube,
    },

    interests: student.interests,
  };
};