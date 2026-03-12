import Category from "./category.model.js";

export const getAllCatgeoriesWithSort = async (sort = "slugAsc") => {
  let sortQuery = { slug: 1 };

  switch (sort) {
    case "nameAsc": sortQuery = { name: 1 }; break;
    case "nameDesc": sortQuery = { name: -1 }; break;
    case "createdAsc": sortQuery = { createdAt: 1 }; break;
    case "createdDesc": sortQuery = { createdAt: -1 }; break;
    case "updatedAsc": sortQuery = { updatedAt: 1 }; break;
    case "updatedDesc": sortQuery = { updatedAt: -1 }; break;
    case "slugDesc": sortQuery = { slug: -1 }; break;
  }

  const categories = await Category.find().sort(sortQuery).lean();
  return categories.map(category => ({
    cateId: category._id,
    cateName: category.name,
    cateSlug: category.slug,
  }));
};

export default {
  getAllCatgeoriesWithSort,
};