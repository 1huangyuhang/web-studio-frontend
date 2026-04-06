import express from 'express';
import {
  getAllPricingPlans,
  getPricingPlanById,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from '../controllers/pricingPlanController';
import { upload } from '../config/multerConfig';

export const pricingPlanPublicRouter = express.Router();
pricingPlanPublicRouter.get('/', getAllPricingPlans);
pricingPlanPublicRouter.get('/:id', getPricingPlanById);

export const pricingPlanManagementRouter = express.Router();
pricingPlanManagementRouter.post(
  '/',
  upload.single('image'),
  createPricingPlan
);
pricingPlanManagementRouter.put(
  '/:id',
  upload.single('image'),
  updatePricingPlan
);
pricingPlanManagementRouter.delete('/:id', deletePricingPlan);
