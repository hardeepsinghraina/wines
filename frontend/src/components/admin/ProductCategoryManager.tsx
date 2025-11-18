'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'

interface ProductCategory {
  id?: string
  name: string
  slug: string
  description: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  imageUrl?: string
  seoTitle?: string
  seoDescription?: string
  productCount?: number
}

interface ProductTag {
  id?: string
  name: string
  slug: string
  color: string
  isActive: boolean
  productCount?: number
}

interface ProductCategoryManagerProps {
  onCategoriesChange?: (categories: ProductCategory[]) => void
  onTagsChange?: (tags: ProductTag[]) => void
}

const PREDEFINED_CATEGORIES = [
  { name: 'Bordeaux', description: 'Premium wines from the Bordeaux region' },
  { name: 'Burgundy', description: 'Elegant wines from Burgundy' },
  { name: 'Champagne', description: 'Sparkling wines from Champagne' },
  { name: 'Rhône Valley', description: 'Rich wines from the Rhône Valley' },
  { name: 'Loire Valley', description: 'Diverse wines from the Loire Valley' },
  { name: 'Alsace', description: 'Aromatic wines from Alsace' },
  { name: 'World Wines', description: 'Premium wines from around the world' },
  { name: 'Vintage Collection', description: 'Rare and aged vintage wines' },
  { name: 'Limited Edition', description: 'Exclusive limited production wines' },
  { name: 'Investment Grade', description: 'Wines suitable for investment' }
]

const PREDEFINED_TAGS = [
  { name: 'Organic', color: '#10B981' },
  { name: 'Biodynamic', color: '#059669' },
  { name: 'Rare', color: '#DC2626' },
  { name: 'Award Winner', color: '#F59E0B' },
  { name: 'Collectible', color: '#7C3AED' },
  { name: 'New Arrival', color: '#3B82F6' },
  { name: 'Best Seller', color: '#EF4444' },
  { name: 'Staff Pick', color: '#8B5CF6' },
  { name: 'Aged 10+ Years', color: '#92400E' },
  { name: 'Perfect Score', color: '#F59E0B' },
  { name: 'Single Vineyard', color: '#065F46' },
  { name: 'Grand Cru', color: '#7C2D12' }
]

export function ProductCategoryManager({ 
  onCategoriesChange, 
  onTagsChange 
}: ProductCategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories')
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [tags, setTags] = useState<ProductTag[]>([])
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null)

  const [newCategory, setNewCategory] = useState<Partial<ProductCategory>>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true,
    sortOrder: 0
  })

  const [newTag, setNewTag] = useState<Partial<ProductTag>>({
    name: '',
    slug: '',
    color: '#3B82F6',
    isActive: true
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleCategoryNameChange = (name: string) => {
    const slug = generateSlug(name)
    setNewCategory({ ...newCategory, name, slug })
  }

  const handleTagNameChange = (name: string) => {
    const slug = generateSlug(name)
    setNewTag({ ...newTag, name, slug })
  }

  const handleAddCategory = () => {
    if (!newCategory.name) return

    const category: ProductCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      slug: newCategory.slug || generateSlug(newCategory.name),
      description: newCategory.description || '',
      parentId: newCategory.parentId || undefined,
      isActive: newCategory.isActive ?? true,
      sortOrder: newCategory.sortOrder || categories.length,
      productCount: 0
    }

    const updatedCategories = [...categories, category]
    setCategories(updatedCategories)
    onCategoriesChange?.(updatedCategories)

    setNewCategory({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      isActive: true,
      sortOrder: 0
    })
    setShowAddCategoryModal(false)
  }

  const handleAddTag = () => {
    if (!newTag.name) return

    const tag: ProductTag = {
      id: Date.now().toString(),
      name: newTag.name,
      slug: newTag.slug || generateSlug(newTag.name),
      color: newTag.color || '#3B82F6',
      isActive: newTag.isActive ?? true,
      productCount: 0
    }

    const updatedTags = [...tags, tag]
    setTags(updatedTags)
    onTagsChange?.(updatedTags)

    setNewTag({
      name: '',
      slug: '',
      color: '#3B82F6',
      isActive: true
    })
    setShowAddTagModal(false)
  }

  const handleUpdateCategory = (id: string, updates: Partial<ProductCategory>) => {
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    )
    setCategories(updatedCategories)
    onCategoriesChange?.(updatedCategories)
  }

  const handleUpdateTag = (id: string, updates: Partial<ProductTag>) => {
    const updatedTags = tags.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    )
    setTags(updatedTags)
    onTagsChange?.(updatedTags)
  }

  const handleDeleteCategory = (id: string) => {
    const updatedCategories = categories.filter(cat => cat.id !== id)
    setCategories(updatedCategories)
    onCategoriesChange?.(updatedCategories)
  }

  const handleDeleteTag = (id: string) => {
    const updatedTags = tags.filter(tag => tag.id !== id)
    setTags(updatedTags)
    onTagsChange?.(updatedTags)
  }

  const handleBulkAddCategories = () => {
    const newCategories = PREDEFINED_CATEGORIES.map((cat, index) => ({
      id: `predefined-${Date.now()}-${index}`,
      name: cat.name,
      slug: generateSlug(cat.name),
      description: cat.description,
      isActive: true,
      sortOrder: categories.length + index,
      productCount: 0
    }))

    const updatedCategories = [...categories, ...newCategories]
    setCategories(updatedCategories)
    onCategoriesChange?.(updatedCategories)
  }

  const handleBulkAddTags = () => {
    const newTags = PREDEFINED_TAGS.map((tag, index) => ({
      id: `predefined-${Date.now()}-${index}`,
      name: tag.name,
      slug: generateSlug(tag.name),
      color: tag.color,
      isActive: true,
      productCount: 0
    }))

    const updatedTags = [...tags, ...newTags]
    setTags(updatedTags)
    onTagsChange?.(updatedTags)
  }

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId)
  }

  const getChildCategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Categories & Tags</h3>
        <div className="flex space-x-2">
          {activeTab === 'categories' ? (
            <>
              <Button
                variant="outline"
                onClick={handleBulkAddCategories}
                disabled={categories.length > 0}
              >
                Add Default Categories
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddCategoryModal(true)}
              >
                Add Category
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBulkAddTags}
                disabled={tags.length > 0}
              >
                Add Default Tags
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddTagModal(true)}
              >
                Add Tag
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-burgundy text-burgundy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📁 Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tags'
                ? 'border-burgundy text-burgundy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏷️ Tags ({tags.length})
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {categories.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 mb-4">No categories created yet</p>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBulkAddCategories}
                >
                  Add Default Categories
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddCategoryModal(true)}
                >
                  Create Custom Category
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {getParentCategories().map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {category.productCount || 0} products
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Slug: /{category.slug}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(category)
                          setNewCategory(category)
                          setShowAddCategoryModal(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Delete category "${category.name}"?`)) {
                            handleDeleteCategory(category.id!)
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Child Categories */}
                  {getChildCategories(category.id!).length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h5>
                      <div className="space-y-2">
                        {getChildCategories(category.id!).map((child) => (
                          <div key={child.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-medium">{child.name}</span>
                              <span className="ml-2 text-xs text-gray-500">({child.productCount || 0} products)</span>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCategory(child)
                                  setNewCategory(child)
                                  setShowAddCategoryModal(true)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  if (confirm(`Delete subcategory "${child.name}"?`)) {
                                    handleDeleteCategory(child.id!)
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          {tags.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 mb-4">No tags created yet</p>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBulkAddTags}
                >
                  Add Default Tags
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddTagModal(true)}
                >
                  Create Custom Tag
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <Card key={tag.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium text-gray-900">{tag.name}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tag.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tag.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Slug: {tag.slug}</p>
                  <p className="text-sm text-gray-600 mb-3">{tag.productCount || 0} products</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTag(tag)
                        setNewTag(tag)
                        setShowAddTagModal(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm(`Delete tag "${tag.name}"?`)) {
                          handleDeleteTag(tag.id!)
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false)
          setEditingCategory(null)
          setNewCategory({
            name: '',
            slug: '',
            description: '',
            parentId: '',
            isActive: true,
            sortOrder: 0
          })
        }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newCategory.name || ''}
                onChange={(e) => handleCategoryNameChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={newCategory.slug || ''}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="category-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newCategory.description || ''}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows={3}
              placeholder="Category description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={newCategory.parentId || ''}
                onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">No parent (top level)</option>
                {getParentCategories().map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                value={newCategory.sortOrder || 0}
                onChange={(e) => setNewCategory({ ...newCategory, sortOrder: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="categoryActive"
              checked={newCategory.isActive ?? true}
              onChange={(e) => setNewCategory({ ...newCategory, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="categoryActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddCategoryModal(false)
                setEditingCategory(null)
                setNewCategory({
                  name: '',
                  slug: '',
                  description: '',
                  parentId: '',
                  isActive: true,
                  sortOrder: 0
                })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingCategory ? () => {
                handleUpdateCategory(editingCategory.id!, newCategory)
                setShowAddCategoryModal(false)
                setEditingCategory(null)
              } : handleAddCategory}
              disabled={!newCategory.name}
            >
              {editingCategory ? 'Update' : 'Add'} Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Tag Modal */}
      <Modal
        isOpen={showAddTagModal}
        onClose={() => {
          setShowAddTagModal(false)
          setEditingTag(null)
          setNewTag({
            name: '',
            slug: '',
            color: '#3B82F6',
            isActive: true
          })
        }}
        title={editingTag ? 'Edit Tag' : 'Add Tag'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newTag.name || ''}
                onChange={(e) => handleTagNameChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Tag name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={newTag.slug || ''}
                onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="tag-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="mt-1 flex items-center space-x-2">
              <input
                type="color"
                value={newTag.color || '#3B82F6'}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={newTag.color || '#3B82F6'}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="tagActive"
              checked={newTag.isActive ?? true}
              onChange={(e) => setNewTag({ ...newTag, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="tagActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddTagModal(false)
                setEditingTag(null)
                setNewTag({
                  name: '',
                  slug: '',
                  color: '#3B82F6',
                  isActive: true
                })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingTag ? () => {
                handleUpdateTag(editingTag.id!, newTag)
                setShowAddTagModal(false)
                setEditingTag(null)
              } : handleAddTag}
              disabled={!newTag.name}
            >
              {editingTag ? 'Update' : 'Add'} Tag
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}