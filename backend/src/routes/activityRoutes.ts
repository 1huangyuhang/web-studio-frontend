import { Router } from 'express';
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController';
import { upload } from '../config/multerConfig';

export const activityPublicRouter = Router();
activityPublicRouter.get('/', getAllActivities);
activityPublicRouter.get('/:id', getActivityById);

export const activityManagementRouter = Router();
activityManagementRouter.post('/', upload.single('image'), createActivity);
activityManagementRouter.put('/:id', upload.single('image'), updateActivity);
activityManagementRouter.delete('/:id', deleteActivity);
