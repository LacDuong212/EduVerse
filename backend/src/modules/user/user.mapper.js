
export const toAuthUserDto = (user) => {
  return {
    userId: user._id?.toString(),
    name: user.name,
    email: user.email,
    avatar: user.pfpImg,
    role: user.role,
  };
};