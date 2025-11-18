'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { adminProductApi, type Product, type ProductQueryParams } from '@/lib/admin-product-api'
import { AdminPermission } from '@/types/admin'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { ProductForm, ProductTable, BulkImportModal } from './index'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductPricingManager } from './ProductPricingManager'
import { ProductInventoryManager } from './ProductInventoryManager'
import { ProductVariantManager } from './ProductVariantManager'
import { ProductSEOManager } from './ProductSEOManager'
import { ProductReviewModerator } from './ProductReviewModerator'
import { ProductRecommendationEngine } from './ProductRecommendationEngine'
import { ProductBulkManager } from './ProductBulkManager'
import { ProductCategoryManager } from './ProductCategoryManager'

export function ProductManagement() {
  const { hasPermission } = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [showAdvancedModal, setShowAdvancedModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'pricing' | 'inventory' | 'variants' | 'seo' | 'reviews' | 'recommendations' | 'bulk' | 'categories'>('basic')

  // Filter states
  const [filters, setFilters] = useState<ProductQueryParams>({
    page: 1,
    limit: 20,
    search: '',
    category: '',
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const canView = hasPermission(AdminPermission.PRODUCTS_VIEW)
  const canCreate = hasPermission(AdminPermission.PRODUCTS_CREATE)
  const canEdit = hasPermission(AdminPermission.PRODUCTS_EDIT)
  const canDelete = hasPermission(AdminPermission.PRODUCTS_DELETE)
  const canBulkImport = hasPermission(AdminPermission.PRODUCTS_BULK_IMPORT)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminProductApi.getProducts(filters)
      setProducts(response.data)
      setPagination(response.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (canView) {
      fetchProducts()
    }
  }, [canView, fetchProducts])

  const handleCreateProduct = async (productData: any) => {
    try {
      await adminProductApi.createProduct(productData)
      setShowCreateModal(false)
      fetchProducts()
    } catch (err) {
      throw err // Let the form handle the error
    }
  }

  const handleEditProduct = async (productData: any) => {
    if (!selectedProduct) return

    try {
      await adminProductApi.updateProduct(selectedProduct.id, productData)
      setShowEditModal(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (err) {
      throw err // Let the form handle the error
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!canDelete) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await adminProductApi.deleteProduct(product.id)
      fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  const handleDeleteById = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      await handleDeleteProduct(product)
    }
  }

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleAdvancedEditClick = (product: Product) => {
    setSelectedProduct(product)
    setActiveTab('basic')
    setShowAdvancedModal(true)
  }

  const handleImageUpload = async (files: FileList): Promise<string[]> => {
    // This would typically upload to a cloud storage service
    // For now, return mock URLs
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      urls.push(`https://example.com/uploads/${Date.now()}-${i}.jpg`)
    }
    return urls
  }

  const handleReviewUpdate = async (reviewId: string, updates: any) => {
    // This would typically call an API to update the review
    console.log('Updating review:', reviewId, updates)
  }

  const handleReviewDelete = async (reviewId: string) => {
    // This would typically call an API to delete the review
    console.log('Deleting review:', reviewId)
  }

  const handleFilterChange = (newFilters: Partial<ProductQueryParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleBulkImportSuccess = () => {
    setShowBulkImportModal(false)
    fetchProducts()
  }

  if (!canView) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view products.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage wine products, inventory, and pricing</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Operations
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveTab('categories')}
          >
            Categories & Tags
          </Button>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)}>
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy"
            >
              <option value="">All Categories</option>
              <option value="Bordeaux">Bordeaux</option>
              <option value="Burgundy">Burgundy</option>
              <option value="Champagne">Champagne</option>
              <option value="Rhône Valley">Rhône Valley</option>
              <option value="World Wines">World Wines</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => handleFilterChange({
                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="vintage-desc">Vintage (Newest)</option>
              <option value="vintage-asc">Vintage (Oldest)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Bulk Operations Tab */}
      {activeTab === 'bulk' && (
        <ProductBulkManager onImportComplete={fetchProducts} />
      )}

      {/* Categories & Tags Tab */}
      {activeTab === 'categories' && (
        <ProductCategoryManager />
      )}

      {/* Products Table */}
      {activeTab === 'basic' && (loading ? (
        <Card className="p-8">
          <Loading />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const usdPrice = product.prices?.find(p => p.currency === 'USD')?.price || 0
                  const totalStock = product.inventory?.reduce((total, inv) => total + inv.quantity, 0) || 0
                  
                  return (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <WineImage
                              src={product.images?.[0]?.url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.producer} • {product.vintage}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${usdPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {canEdit && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(product)}
                            >
                              Quick Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleAdvancedEditClick(product)}
                            >
                              Advanced
                            </Button>
                          </>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteById(product.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-burgundy border-burgundy text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Create Product Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Product"
        size="lg"
      >
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedProduct(null)
        }}
        title="Edit Product"
        size="lg"
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onSubmit={handleEditProduct}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedProduct(null)
            }}
          />
        )}
      </Modal>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={handleBulkImportSuccess}
      />

      {/* Advanced Product Management Modal */}
      <Modal
        isOpen={showAdvancedModal}
        onClose={() => {
          setShowAdvancedModal(false)
          setSelectedProduct(null)
          setActiveTab('basic')
        }}
        title={`Advanced Product Management: ${selectedProduct?.name || ''}`}
        size="xl"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'basic', name: 'Basic Info', icon: '📝' },
                  { id: 'images', name: 'Images', icon: '🖼️' },
                  { id: 'pricing', name: 'Pricing', icon: '💰' },
                  { id: 'inventory', name: 'Inventory', icon: '📦' },
                  { id: 'variants', name: 'Variants', icon: '🔄' },
                  { id: 'seo', name: 'SEO', icon: '🔍' },
                  { id: 'reviews', name: 'Reviews', icon: '⭐' },
                  { id: 'recommendations', name: 'Recommendations', icon: '🎯' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-burgundy text-burgundy'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'basic' && (
                <ProductForm
                  product={selectedProduct}
                  onSubmit={handleEditProduct}
                  onCancel={() => setShowAdvancedModal(false)}
                />
              )}

              {activeTab === 'images' && (
                <ProductImageGallery
                  images={selectedProduct.images || []}
                  onImagesChange={(images) => {
                    // Update product images
                    console.log('Images updated:', images)
                  }}
                  onUpload={handleImageUpload}
                />
              )}

              {activeTab === 'pricing' && (
                <ProductPricingManager
                  prices={selectedProduct.prices || []}
                  onPricesChange={(prices) => {
                    // Update product prices
                    console.log('Prices updated:', prices)
                  }}
                />
              )}

              {activeTab === 'inventory' && (
                <ProductInventoryManager
                  inventory={selectedProduct.inventory || []}
                  onInventoryChange={(inventory) => {
                    // Update product inventory
                    console.log('Inventory updated:', inventory)
                  }}
                />
              )}

              {activeTab === 'variants' && (
                <ProductVariantManager
                  variants={[]} // This would come from the product data
                  onVariantsChange={(variants) => {
                    // Update product variants
                    console.log('Variants updated:', variants)
                  }}
                  baseProductSku={selectedProduct.sku}
                />
              )}

              {activeTab === 'seo' && (
                <ProductSEOManager
                  seo={{}} // This would come from the product data
                  onSEOChange={(seo) => {
                    // Update product SEO
                    console.log('SEO updated:', seo)
                  }}
                  productName={selectedProduct.name}
                  productDescription={selectedProduct.description}
                />
              )}

              {activeTab === 'reviews' && (
                <ProductReviewModerator
                  productId={selectedProduct.id}
                  reviews={[]} // This would come from an API call
                  onReviewUpdate={handleReviewUpdate}
                  onReviewDelete={handleReviewDelete}
                />
              )}

              {activeTab === 'recommendations' && (
                <ProductRecommendationEngine
                  productId={selectedProduct.id}
                  recommendations={[]} // This would come from the product data
                  onRecommendationsChange={(recommendations) => {
                    // Update product recommendations
                    console.log('Recommendations updated:', recommendations)
                  }}
                  availableProducts={products.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    price: p.prices?.find(price => price.currency === 'USD')?.price || 0
                  }))}
                />
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAdvancedModal(false)
                  setSelectedProduct(null)
                  setActiveTab('basic')
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // Save all changes
                  console.log('Saving all product changes')
                  setShowAdvancedModal(false)
                  setSelectedProduct(null)
                  setActiveTab('basic')
                  fetchProducts()
                }}
              >
                Save All Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}