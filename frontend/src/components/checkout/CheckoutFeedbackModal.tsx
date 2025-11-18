'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCheckoutAnalytics, CheckoutFunnelStage, CheckoutFeedback } from '@/lib/checkout-analytics';

interface CheckoutFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: CheckoutFunnelStage;
  onSubmit?: (feedback: CheckoutFeedback) => void;
}

const COMMON_ISSUES = [
  'Form was confusing',
  'Too many steps',
  'Payment options unclear',
  'Shipping costs too high',
  'Site was slow',
  'Error messages unhelpful',
  'Missing information',
  'Trust concerns'
];

const STEP_SPECIFIC_QUESTIONS = {
  [CheckoutFunnelStage.CHECKOUT_START]: {
    title: 'Checkout Start Experience',
    questions: [
      'Was it easy to start the checkout process?',
      'Were you clear about what information was needed?',
      'Did the page load quickly?'
    ]
  },
  [CheckoutFunnelStage.SHIPPING_ADDRESS]: {
    title: 'Shipping Address Experience',
    questions: [
      'Was the address form easy to fill out?',
      'Did you find all the fields you needed?',
      'Were the validation messages helpful?'
    ]
  },
  [CheckoutFunnelStage.SHIPPING_METHOD]: {
    title: 'Shipping Method Experience',
    questions: [
      'Were the shipping options clear?',
      'Were the costs reasonable?',
      'Was delivery time information helpful?'
    ]
  },
  [CheckoutFunnelStage.PAYMENT_METHOD]: {
    title: 'Payment Experience',
    questions: [
      'Were payment options clear?',
      'Did you feel secure entering payment info?',
      'Was the crypto payment process smooth?'
    ]
  },
  [CheckoutFunnelStage.ORDER_REVIEW]: {
    title: 'Order Review Experience',
    questions: [
      'Was all information clearly displayed?',
      'Could you easily make changes?',
      'Did you feel confident placing the order?'
    ]
  },
  [CheckoutFunnelStage.ORDER_COMPLETE]: {
    title: 'Order Completion Experience',
    questions: [
      'Was the order confirmation clear?',
      'Did you receive all necessary information?',
      'How was your overall checkout experience?'
    ]
  },
  [CheckoutFunnelStage.CHECKOUT_ABANDON]: {
    title: 'Checkout Experience',
    questions: [
      'What made you consider leaving?',
      'Was there anything confusing?',
      'How could we improve the process?'
    ]
  }
};

export function CheckoutFeedbackModal({ 
  isOpen, 
  onClose, 
  currentStep, 
  onSubmit 
}: CheckoutFeedbackModalProps) {
  const analytics = useCheckoutAnalytics();
  const [rating, setRating] = useState<number>(0);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stepInfo = STEP_SPECIFIC_QUESTIONS[currentStep] || {
    title: 'Checkout Experience',
    questions: ['How was your overall checkout experience?']
  };

  const handleIssueToggle = (issue: string) => {
    setSelectedIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    const feedback: CheckoutFeedback = {
      rating,
      comment: comment.trim() || undefined,
      step: currentStep,
      issues: selectedIssues,
      suggestions: suggestions.trim() || undefined
    };

    try {
      analytics.collectFeedback(feedback);
      
      if (onSubmit) {
        await onSubmit(feedback);
      }

      // Track feedback submission
      analytics.trackFormInteraction('feedback', 'submit', {
        rating,
        issueCount: selectedIssues.length,
        hasComment: !!comment.trim(),
        hasSuggestions: !!suggestions.trim()
      });

      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Track feedback dismissal
    analytics.trackFormInteraction('feedback', 'dismiss', {
      step: currentStep,
      partialRating: rating,
      partialIssues: selectedIssues.length
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Help Us Improve">
      <Card className="p-6 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">
              {stepInfo.title}
            </h3>
            <p className="text-sm text-muted-olive">
              Your feedback helps us improve the checkout experience
            </p>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-3">
              How would you rate this step?
            </label>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 rounded-full transition-colors ${
                    star <= rating
                      ? 'bg-burgundy text-ivory'
                      : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-olive mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Issues */}
          {rating > 0 && rating < 4 && (
            <div>
              <label className="block text-sm font-medium text-charcoal-black mb-3">
                What issues did you encounter? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_ISSUES.map((issue) => (
                  <label
                    key={issue}
                    className="flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIssues.includes(issue)}
                      onChange={() => handleIssueToggle(issue)}
                      className="rounded border-gray-300 text-burgundy focus:ring-burgundy"
                    />
                    <span className="text-charcoal-black">{issue}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-2">
              Additional comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-olive mt-1">
              {comment.length}/500 characters
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <label className="block text-sm font-medium text-charcoal-black mb-2">
              How can we improve? (optional)
            </label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Your suggestions for improvement..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent resize-none"
              rows={2}
              maxLength={300}
            />
            <div className="text-xs text-muted-olive mt-1">
              {suggestions.length}/300 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-burgundy text-ivory hover:bg-opacity-90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </Card>
    </Modal>
  );
}