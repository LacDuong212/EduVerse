import AppError from "#exceptions/app.error.js";
import { updateProfile } from "#modules/user/user.service.js";
import { withTransaction } from "#utils/transaction.js";
import Student from "./student.model.js"

export const createNewStudent = async (userId) => {
  if (!userId) throw new AppError("User ID is required", 400);
  const student = await Student.create({ user: userId });
  return student;
};

export const updateStudentProfile = async (userId, changes, session = null) => {
  if (!userId) throw new AppError("Student ID is required.", 400);

  return await withTransaction(async (s) => {
    const student = await Student.findOne({ user: userId }).session(s);
    if (!student) throw new AppError("Student not found.", 404);

    const { userUpdate, stuUpdate } = getUpdateData(changes);

    Object.keys(stuUpdate).forEach((key) => {
      student.set(key, stuUpdate[key]);
    });

    if (userUpdate && Object.keys(userUpdate).length > 0)
      await updateProfile(userId, userUpdate, s);

    await student.save({ session: s });

    const result = await student.populate({
      path: "user",
      select: "name email phonenumber pfpImg website socials"
    });

    return result.toObject();
  }, session);
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

  const stuUpdate = {};

  if (data.interests !== undefined) stuUpdate.interests = data.interests;

  return { userUpdate, stuUpdate };
};

export const getStudentProfile = async (userId) => {
  if (!userId) throw new AppError("Student ID is required.", 400);

  const student = await Student.findOne({ user: userId })
    .populate({
      path: "user",
      select: "name email phonenumber pfpImg website socials"
    }).lean();
  if (!student) throw new AppError("Student not found.", 404);

  return student;
};

export const updateStudentInterests = async (userId, interests) => {
  if (!interests && !Array.isArray(interests))
    throw new AppError("Interests must be an array.", 400);

  const updated = await Student.findOneAndUpdate(
    { user: userId },
    { interests: interests },
    { new: true, lean: true }
  );

  return updated.interests;
};