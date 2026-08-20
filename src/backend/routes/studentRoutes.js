import { Router } from 'express';
import {
  upsertApplication,
  getMyApplication,
  getAllApplications,
  getApplicationDetails,
  updateApplicationStatus,
  deleteApplication,
  getStats,
} from '../controllers/studentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Mount authenticateUser as a general guard for student routes
router.use(authenticateUser);

router.post('/', upsertApplication);
router.get('/my', getMyApplication);
router.get('/', getAllApplications);
router.get('/stats', getStats);
router.get('/:id', getApplicationDetails);
router.put('/:id', updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;
