import { Router } from 'express';
import { body } from 'express-validator';
import { ContactController } from '../controllers/contact.controller';
import { handleValidationErrors } from '../middleware/validation';
import rateLimit from 'express-rate-limit';

const router = Router();
const contactController = new ContactController();

// Contact form submission with rate limiting
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many contact form submissions, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/submit',
  contactFormLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('category')
      .isIn(['general', 'orders', 'shipping', 'payments', 'wine-advice', 'technical', 'partnership'])
      .withMessage('Please select a valid category'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters')
  ],
  handleValidationErrors,
  contactController.submitContactForm
);

export { router as contactRoutes };