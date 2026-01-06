import userServices from "./user.services.js";

class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await userServices.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch users",
      });
    }
  }
  // Update user
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const updatedUser = await userServices.updateUser(userId, updateData);
      let message = "User updated successfully";
      if (updateData?.email) {
        message +=
          ". Please verify your new email address to complete the update.";
      }
      res.status(200).json({
        success: true,
        message: message,
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  }

  // Soft delete user
  async softDeleteUser(req, res) {
    try {
      const { userId } = req.params;
      const deletedUser = await userServices.softDeleteUser(userId);
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  }
}
export default new UserController();
