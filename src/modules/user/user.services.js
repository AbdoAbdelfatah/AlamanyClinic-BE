import User from "../../models/user.model.js";
import { sendVerificationEmail } from "../../utils/mail.util.js";
import crypto from "crypto";

class UserService {
  async getAllUsers() {
    try {
      const users = await User.find().select("-password");
      return users;
    } catch (error) {
      throw new Error("Error fetching users: " + error.message);
    }
  }
  async updateUser(userId, updateData) {
    try {
      if (updateData?.email) {
        const emailExits = await User.findOne({ email: updateData.email });
        if (emailExits) {
          throw new Error("Email already Exists");
        }
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // Hash and store token
        updateData.emailVerificationToken = crypto
          .createHash("sha256")
          .update(verificationToken)
          .digest("hex");
        updateData.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        updateData.isEmailVerified = false;
        await sendVerificationEmail(
          updateData.email,
          verificationToken,
          updatedUser.firstName
        );
      }
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password -emailVerificationToken");
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error("Error updating user: " + error.message);
    }
  }

  async softDeleteUser(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      ).select("-password");
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error("Error deleting user: " + error.message);
    }
  }

  // Additional user-related service methods can be added here
}

export default new UserService();
