
export const toInstructorDetails = (instructor, timestamp = false) => {
  if(!instructor) return null;

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
    insId: instructor.user?._id,

    name: instructor.user?.name || null,
    email: instructor.user?.email || null,
    phonenumber: instructor.user?.phonenumber,
    avatar: instructor.user?.pfpImg || null,
    address: instructor.address,
    occupation: instructor.occupation || null,
    
    website: instructor.user?.website || null,
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
      updatedAt: instructor.updatedAt 
    })
  };
};