import Blog from "../../models/blog.model.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { successResponse } from "../../utils/response.util.js";

class BlogController {
// @desc    Create new blog (Doctor only)
// @route   POST /api/blogs
// @access  Private/Doctor
async createBlog (req, res, next){
  try {
    const { title, content, coverImage, category } = req.body;
    const authorId = req.user.id; // Assuming user info is attached by auth middleware

    const blog = await Blog.create({
      title,
      content,
      coverImage,
      category,
      author: authorId,
    });

    await blog.populate("author", "name specialization");

    return successResponse(res, 201, "Blog created successfully", blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
async getAllBlogs (req, res, next) {
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
};

// @desc    Delete blog (Admin only)
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
async deleteBlog(req, res, next){
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
};


}

export default new BlogController();