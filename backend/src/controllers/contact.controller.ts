import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  submitContactForm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, subject, category, message } = req.body;
      
      const contactData = {
        name,
        email,
        subject,
        category,
        message,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || '',
        submittedAt: new Date()
      };

      const result = await this.contactService.submitContactForm(contactData);

      logger.info('Contact form submitted', {
        email,
        category,
        subject: subject.substring(0, 50)
      });

      res.status(201).json(
        successResponse(
          result,
          'Contact form submitted successfully. We will respond within 24 hours.'
        )
      );
    } catch (error) {
      logger.error('Contact form submission failed', error);
      res.status(500).json(
        errorResponse('Failed to submit contact form. Please try again later.')
      );
    }
  };
}