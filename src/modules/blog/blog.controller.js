import Blog from "../../models/blog.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { successResponse } from "../../utils/response.util.js";

class BlogController {
  // @desc    Create new blog (Admin only)
  // @route   POST /api/blogs
  // @access  Private/Admin
  async createBlog(req, res, next) {
    try {
      const { content, title, summary, tags, category } = req.body;
      const coverImage = req.file ? req.file.path : null;

      const blog = await Blog.create({
        title,
        content,
        summary,
        tags,
        coverImage,
        category,
      });

      return successResponse(res, 201, "Blog created successfully", blog);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all blogs
  // @route   GET /api/blogs
  // @access  Public
  async getAllBlogs(req, res, next) {
    try {
      const { category, author, page = 1, limit = 10, search } = req.query;

      const query = {};

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Filter by author
      if (author) {
        query.author = author;
      }

      // Search by title or content
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const blogs = await Blog.find(query)
        .populate("author", "name specialization profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Blog.countDocuments(query);

      return successResponse(res, 200, "Blogs retrieved successfully", {
        blogs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalBlogs: total,
          limit: Number(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get blog by ID
  // @route   GET /api/blogs/:id
  // @access  Public
  async getBlogById(req, res, next) {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id).populate(
        "author",
        "name specialization profileImage"
      );

      if (!blog) {
        throw new ErrorClass("Blog not found", 404);
      }

      return successResponse(res, 200, "Blog retrieved successfully", blog);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update blog (Admin only)
  // @route   PUT /api/blogs/:id
  // @access  Private/Admin
  async updateBlog(req, res, next) {
    try {
      const { id } = req.params;
      const { content, title, summary, tags, category } = req.body;
      const coverImage = req.file ? req.file.path : null;

      const updateData = {
        title,
        content,
        summary,
        tags,
        category,
      };

      if (coverImage) {
        updateData.coverImage = coverImage;
      }

      const blog = await Blog.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!blog) {
        throw new ErrorClass("Blog not found", 404);
      }

      return successResponse(res, 200, "Blog updated successfully", blog);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete blog (Admin only)
  // @route   DELETE /api/blogs/:id
  // @access  Private/Admin
  async deleteBlog(req, res, next) {
    try {
      const { id } = req.params;

      const blog = await Blog.findByIdAndDelete(id);

      if (!blog) {
        throw new ErrorClass("Blog not found", 404);
      }

      return successResponse(res, 200, "Blog deleted successfully", null);
    } catch (error) {
      next(error);
    }
  }
}

export default new BlogController();
