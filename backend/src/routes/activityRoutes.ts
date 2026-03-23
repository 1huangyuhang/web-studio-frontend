import { Router } from 'express';
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController';
import { upload } from '../config/multerConfig';

const router = Router();

router.get('/', getAllActivities);
router.get('/:id', getActivityById);
router.post('/', upload.single('image'), createActivity);
router.put('/:id', upload.single('image'), updateActivity);
router.delete('/:id', deleteActivity);

export default router;
