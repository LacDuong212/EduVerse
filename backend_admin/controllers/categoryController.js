import Category from "../models/categoryModel.js";
import Course from "../models/courseModel.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Please provide a category name." });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists." });
    }

    const newCategory = new Category({ name });
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const mode = req.query.mode;

    let query = Category.find().sort({ createdAt: -1 });

    if (mode === 'all') {
      const categories = await query;
      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } else {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const total = await Category.countDocuments();
      const categories = await query.skip(skip).limit(limit);

      res.status(200).json({
        success: true,
        data: categories,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    category.name = name || category.name;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const courseUsingCategory = await Course.findOne({ category: id });
    if (courseUsingCategory) {
      return res.status(400).json({
        message: "Cannot delete this category because it is being used by existing courses. Please delete or reassign those courses first."
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};