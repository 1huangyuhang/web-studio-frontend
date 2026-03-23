import { Router } from 'express';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { upload } from '../config/multerConfig';

const router = Router();

router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.post('/', upload.single('image'), createNews);
router.put('/:id', upload.single('image'), updateNews);
router.delete('/:id', deleteNews);

export default router;
