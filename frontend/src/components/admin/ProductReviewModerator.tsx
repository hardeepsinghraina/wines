'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'

interface ProductReview {
  id: string
  userId: string
  userName: string
  userEmail: string
  rating: number
  title: string
  comment: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  createdAt: string
  updatedAt: string
  isVerifiedPurchase: boolean
  helpfulVotes: number
  reportCount: number
  moderatorNotes?: string
}

interface ProductReviewModeratorProps {
  productId: string
  reviews: ProductReview[]
  onReviewUpdate: (reviewId: string, updates: Partial<ProductReview>) => void
  onReviewDelete: (reviewId: string) => void
}

export function ProductReviewModerator({ 
  productId, 
  reviews, 
  onReviewUpdate, 
  onReviewDelete 
}: ProductReviewModeratorProps) {
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'reports'>('newest')
  const [moderatorNotes, setModeratorNotes] = useState('')

  const filteredReviews = reviews.filter(review => {
    if (filterStatus === 'all') return true
    return review.status === filterStatus
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'rating':
        return b.rating - a.rating
      case 'reports':
        return b.reportCount - a.reportCount
      default:
        return 0
    }
  })

  const handleReviewAction = (reviewId: string, status: ProductReview['status'], notes?: string) => {
    onReviewUpdate(reviewId, { 
      status, 
      moderatorNotes: notes,
      updatedAt: new Date().toISOString()
    })
  }

  const handleBulkAction = (action: 'approve' | 'reject', reviewIds: string[]) => {
    reviewIds.forEach(id => {
      handleReviewAction(id, action === 'approve' ? 'approved' : 'rejected')
    })
  }

  const openReviewDetail = (review: ProductReview) => {
    setSelectedReview(review)
    setModeratorNotes(review.moderatorNotes || '')
    setShowDetailModal(true)
  }

  const saveModeratorNotes = () => {
    if (selectedReview) {
      onReviewUpdate(selectedReview.id, { moderatorNotes })
      setShowDetailModal(false)
    }
  }

  const getStatusColor = (status: ProductReview['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'flagged':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReviewStats = () => {
    const stats = {
      total: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
      flagged: reviews.filter(r => r.status === 'flagged').length,
      averageRating: reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0
    }
    return stats
  }

  const stats = getReviewStats()

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Review Moderation</h3>
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rating</option>
            <option value="reports">Most Reports</option>
          </select>
        </div>
      </div>

      {/* Review Statistics */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.flagged}</div>
            <div className="text-sm text-gray-600">Flagged</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>
      </Card>

      {sortedReviews.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No reviews found for the selected filter</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedReviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                    {review.reportCount > 0 && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        {review.reportCount} Reports
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900">{review.title}</h4>
                  <p className="text-gray-700 mt-1">{review.comment}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>By {review.userName}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    <span>{review.helpfulVotes} helpful votes</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {review.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewAction(review.id, 'approved')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewAction(review.id, 'rejected')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {review.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReviewAction(review.id, 'rejected')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  )}
                  
                  {review.status === 'rejected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReviewAction(review.id, 'approved')}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      Approve
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReviewAction(review.id, 'flagged')}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    Flag
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReviewDetail(review)}
                  >
                    Details
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this review?')) {
                        onReviewDelete(review.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Review Details"
        size="lg"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReview.userName}</p>
                <p className="text-xs text-gray-500">{selectedReview.userEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-1 flex">{renderStars(selectedReview.rating)}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Review Title</label>
              <p className="mt-1 text-sm text-gray-900">{selectedReview.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Review Comment</label>
              <p className="mt-1 text-sm text-gray-900">{selectedReview.comment}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReview.status)}`}>
                  {selectedReview.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Verified Purchase</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedReview.isVerifiedPurchase ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Helpful Votes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReview.helpfulVotes}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Report Count</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReview.reportCount}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Moderator Notes</label>
              <textarea
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={3}
                placeholder="Add internal notes about this review..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveModeratorNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}