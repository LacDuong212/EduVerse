
export const toAuthUserDto = (user) => {
  if (!user) return null;

  return {
    userId: user._id?.toString(),
    name: user.name,
    email: user.email,
    avatar: user.pfpImg,
    role: user.role,
  };
};