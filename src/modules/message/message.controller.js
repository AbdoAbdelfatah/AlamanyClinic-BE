import messageService from "./message.service.js";
import { successResponse } from "../../utils/response.util.js";

class MessageController {
  async createMessage(req, res, next) {
    try {
      const message = await messageService.createMessage(req.body);
      return successResponse(res, 201, "Message sent successfully", message);
    } catch (error) {
      next(error);
    }
  }

  async getAllMessages(req, res, next) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const result = await messageService.getAllMessages({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
      });
      return successResponse(res, 200, "Messages retrieved successfully", {
        messages: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      await messageService.deleteMessage(req.params.id);
      return successResponse(res, 200, "Message deleted successfully", null);
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
