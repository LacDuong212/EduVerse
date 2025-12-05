import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import { 
  createCategory, 
  getAllCategories, 
  updateCategory, 
  deleteCategory 
} from "../controllers/categoryController.js";

const categoryRoute = express.Router();

categoryRoute.use(adminAuth);

categoryRoute.post("/", createCategory);
categoryRoute.get("/", getAllCategories);
categoryRoute.put("/:id", updateCategory);
categoryRoute.delete("/:id", deleteCategory);

export default categoryRoute;