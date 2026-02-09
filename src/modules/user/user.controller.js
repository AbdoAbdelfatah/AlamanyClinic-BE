import userServices from "./user.services.js";
import { successResponse } from "../../utils/response.util.js";

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await userServices.getAllUsers();
      return successResponse(res, 200, "Users retrieved successfully", users);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      const updatedUser = await userServices.updateUser(userId, updateData);
      return successResponse(res, 200, "User updated successfully", updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async softDeleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      const deletedUser = await userServices.softDeleteUser(userId);
      return successResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
