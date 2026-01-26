import Message from "../../models/message.model.js";

class MessageService {
  // Create a new message
  async createMessage(messageData) {
    try {
      const { name, email, phone, message } = messageData;

      // Validate required fields
      if (!name || !email || !message) {
        throw new Error("Name, email, and message are required");
      }

      // Create and save message
      const newMessage = new Message({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        message: message.trim(),
      });

      await newMessage.save();

      return newMessage;
    } catch (error) {
      throw error;
    }
  }

  // Get all messages (admin only)
  async getAllMessages(options = {}) {
    try {
      const { page = 1, limit = 10, search } = options;

      const query = {};

      // Search by name or email
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Message.countDocuments(query);

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      return {
        messages,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const message = await Message.findByIdAndDelete(messageId);

      if (!message) {
        throw new Error("Message not found");
      }

      return message;
    } catch (error) {
      throw error;
    }
  }
}

export default new MessageService();
