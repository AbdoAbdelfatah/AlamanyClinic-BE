import Message from "../../models/message.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";

class MessageService {
  async createMessage(messageData) {
    const { name, email, phone, message } = messageData ?? {};
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      throw new ErrorClass("Name, email, and message are required", 400, null, "createMessage");
    }
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      message: message.trim(),
    });
    return newMessage;
  }

  async getAllMessages(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    return {
      messages,
      pagination: {
        total,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    };
  }

  async deleteMessage(messageId) {
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      throw new ErrorClass("Message not found", 404, null, "deleteMessage");
    }
    return message;
  }
}

export default new MessageService();
