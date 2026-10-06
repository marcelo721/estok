import { Router } from 'express';
import { login, logout, requestPasswordReset } from '../controllers/AuthController.js';
import { listProducts, createProduct, updateProduct, listCategories } from '../controllers/ProductController.js';
import { registerMovement, getHistory } from '../controllers/MovementController.js';
import { getDashboardData } from '../controllers/DashboardController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/AuthMiddleware.js';

const router = Router();

router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/reset-password', requestPasswordReset);

router.use(authenticateToken);

router.get('/dashboard', getDashboardData);

router.get('/categories', listCategories);
router.get('/products', listProducts);
router.post('/products', authorizeRoles('ADMIN'), createProduct);
router.put('/products/:id', authorizeRoles('ADMIN'), updateProduct);

router.post('/movements', registerMovement);
router.get('/movements/history', getHistory);

export default router;