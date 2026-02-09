import User from "../../models/user.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

const allowedUpdateFields = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "isActive",
];

class UserService {
  async getAllUsers() {
    const users = await User.find().select("-password -refreshToken");
    return users;
  }

  async updateUser(userId, updateData) {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw new ErrorClass("User not found", 404, null, "updateUser");
    }

    if (updateData?.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists) {
        throw new ErrorClass("Email already exists", 400, null, "updateUser");
      }
    }

    const filtered = {};
    for (const key of allowedUpdateFields) {
      if (updateData[key] !== undefined) filtered[key] = updateData[key];
    }

    const user = await User.findByIdAndUpdate(userId, filtered, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    return user;
  }

  async softDeleteUser(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ErrorClass("User not found", 404, null, "softDeleteUser");
    }

    return user;
  }
}

export default new UserService();
