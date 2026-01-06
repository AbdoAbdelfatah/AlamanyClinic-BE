import User from "../../models/user.model.js";

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
        updateData.isEmailVerified = false;
      }
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");
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
