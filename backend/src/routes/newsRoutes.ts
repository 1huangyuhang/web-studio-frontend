import { Router } from 'express';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { upload } from '../config/multerConfig';

export const newsPublicRouter = Router();
newsPublicRouter.get('/', getAllNews);
newsPublicRouter.get('/:id', getNewsById);

export const newsManagementRouter = Router();
newsManagementRouter.post('/', upload.single('image'), createNews);
newsManagementRouter.put('/:id', upload.single('image'), updateNews);
newsManagementRouter.delete('/:id', deleteNews);
