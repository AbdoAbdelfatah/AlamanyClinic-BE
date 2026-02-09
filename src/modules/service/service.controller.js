import Service from "../../models/service.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { successResponse } from "../../utils/response.util.js";

class ServiceController {
  async createService(req, res, next) {
    try {
      const { name, description, category, duration } = req.body;
      // Parse nested price object from form-data
      const price = {
        min: Number(req.body.price.min) || 0,
        max: Number(req.body.price.max) || 0,
        currency: req.body.price.currency || "USD",
      };

      // Validate price range
      if (price.min < 0 || price.max < 0) {
        throw new ErrorClass("Price cannot be negative", 400);
      }

      if (price.max > 0 && price.min > price.max) {
        throw new ErrorClass(
          "Minimum price cannot be greater than maximum price",
          400
        );
      }

      // Handle file upload (multer)
      const coverImage = req.file ? req.file.path : null;

      // Check if service already exists
      const existingService = await Service.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") }, // Case-insensitive check
      });

      if (existingService) {
        throw new ErrorClass("Service with this name already exists", 400);
      }

      // Create service
      const service = await Service.create({
        name,
        description,
        coverImage,
        category,
        price,
        duration,
      });

      return successResponse(res, 201, "Service created successfully", service);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all services
  // @route   GET /api/services
  // @access  Public
  async getAllServices(req, res, next) {
    try {
      const { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

      const query = {};

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Filter by price range
      if (minPrice || maxPrice) {
        query["price.min"] = {};
        if (minPrice) query["price.min"].$gte = Number(minPrice);
        if (maxPrice) query["price.max"].$lte = Number(maxPrice);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const services = await Service.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Service.countDocuments(query);

      return successResponse(res, 200, "Services retrieved successfully", {
        services,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalServices: total,
          limit: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete service (Admin only)
  // @route   DELETE /api/services/:id
  // @access  Private/Admin
  async deleteService(req, res, next) {
    try {
      const { id } = req.params;

      const service = await Service.findByIdAndDelete(id);

      if (!service) {
        throw new ErrorClass("Service not found", 404);
      }

      return successResponse(res, 200, "Service deleted successfully", null);
    } catch (error) {
      next(error);
    }
  }
}

export const serviceController = new ServiceController();
