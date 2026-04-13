
const getUserBasicInfo = (user) => ({
  userId: user._id?.toString(),
  name: user.name || null,
  email: user.email || null,
  avatar: user.pfpImg || null,
});

export const toAuthUserDto = (user) => {
  if (!user) return null;

  return {
    ...getUserBasicInfo(user),
    role: user.role || "guest",
  };
};

export const toUserDetailsDto = (user) => {
  if (!user) return null;

  const socials = {
    facebook: null,
    instagram: null,
    linkedin: null,
    youtube: null
  };

  return {
    ...getUserBasicInfo(user),
    phonenumber: user.phonenumber || null, 
    bio: user.bio || null,
    website: user.website || null, 
    socials: user.socials || socials,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};