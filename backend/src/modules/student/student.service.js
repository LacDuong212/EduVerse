import AppError from "#exceptions/app.error.js";
import { updateProfile } from "#modules/user/user.service.js";
import { withTransaction } from "#utils/transaction.js";
import Student from "./student.model.js"

export const createNewStudent = async (userId) => {
  if (!userId) throw new AppError("User ID is required", 400);
  const student = await Student.create({ user: userId });
  return student;
};

export const updateStudentProfile = async (userId, changes) => {
  if (!userId) throw new AppError("Student ID is required.", 400);
  return await withTransaction(async (s) => {
    const updated = await updateProfile(userId, getUpdateData(changes), s);
    return updated;
  });
};

const getUpdateData = (data) => {
  const userUpdate = {};

  if (data.name) userUpdate.name = data.name;
  if (data.phonenumber !== undefined) userUpdate.phonenumber = data.phonenumber;
  if (data.avatar !== undefined) userUpdate.pfpImg = data.avatar;
  if (data.website !== undefined) userUpdate.website = data.website;
  if (data.socials?.facebook !== undefined) userUpdate["socials.facebook"] = data.socials.facebook;
  if (data.socials?.instagram !== undefined) userUpdate["socials.instagram"] = data.socials.instagram;
  if (data.socials?.linkedin !== undefined) userUpdate["socials.linkedin"] = data.socials.linkedin;
  if (data.socials?.youtube !== undefined) userUpdate["socials.youtube"] = data.socials.youtube;

  return userUpdate;
};