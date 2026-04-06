import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController';
import { upload } from '../config/multerConfig';
import { uploadWriteRateLimitMiddleware } from '../middleware/rateLimitMiddleware';

export const coursePublicRouter = express.Router();
coursePublicRouter.get('/', getAllCourses);
coursePublicRouter.get('/:id', getCourseById);

export const courseManagementRouter = express.Router();
courseManagementRouter.post(
  '/',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  createCourse
);
courseManagementRouter.put(
  '/:id',
  uploadWriteRateLimitMiddleware,
  upload.single('image'),
  updateCourse
);
courseManagementRouter.delete('/:id', deleteCourse);
