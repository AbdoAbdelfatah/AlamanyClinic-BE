import messageService from "./message.service.js";

class MessageController {
  // Create a new message (public - anyone can send)
  async createMessage(req, res) {
    try {
      const messageData = req.body;

      const message = await messageService.createMessage(messageData);

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to send message",
      });
    }
  }

  // Get all messages (admin only)
  async getAllMessages(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const result = await messageService.getAllMessages({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
      });

      res.status(200).json({
        success: true,
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch messages",
      });
    }
  }

  // Delete a message (admin only)
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;

      await messageService.deleteMessage(id);

      res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message || "Failed to delete message",
      });
    }
  }
}

export default new MessageController();
