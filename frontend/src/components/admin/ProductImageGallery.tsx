'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface ProductImage {
  id?: string
  url: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  onUpload?: (files: FileList) => Promise<string[]>
}

export function ProductImageGallery({ 
  images, 
  onImagesChange, 
  onUpload 
}: ProductImageGalleryProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !onUpload) return

    try {
      setUploading(true)
      const uploadedUrls = await onUpload(files)
      
      const newImages: ProductImage[] = uploadedUrls.map((url, index) => ({
        url,
        altText: '',
        isPrimary: images.length === 0 && index === 0,
        sortOrder: images.length + index
      }))

      onImagesChange([...images, ...newImages])
      setShowUploadModal(false)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // If we removed the primary image, make the first remaining image primary
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }
    // Update sort orders
    newImages.forEach((img, i) => {
      img.sortOrder = i
    })
    onImagesChange(newImages)
  }

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    onImagesChange(newImages)
  }

  const handleUpdateAltText = (index: number, altText: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], altText }
    onImagesChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    // Remove dragged image
    newImages.splice(draggedIndex, 1)
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage)
    
    // Update sort orders
    newImages.forEach((img, i) => {
      img.sortOrder = i
    })
    
    onImagesChange(newImages)
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">No images uploaded yet</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUploadModal(true)}
            className="mt-2"
          >
            Upload First Image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden bg-white"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="aspect-square relative">
                <OptimizedImage
                  src={image.url}
                  alt={image.altText || `Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                    Primary
                  </div>
                )}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </Button>
                </div>
              </div>
              
              <div className="p-2 space-y-2">
                <input
                  type="text"
                  placeholder="Alt text"
                  value={image.altText || ''}
                  onChange={(e) => handleUpdateAltText(index, e.target.value)}
                  className="w-full text-xs px-2 py-1 border rounded"
                />
                
                {!image.isPrimary && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetPrimary(index)}
                    className="w-full text-xs"
                  >
                    Set as Primary
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Product Images"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            
            <div className="space-y-2">
              <p className="text-gray-600">
                Drag and drop images here, or click to select files
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select Images'}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}