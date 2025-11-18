'use client'

import React from 'react'
import { InventoryDashboard } from '../../../components/admin/InventoryDashboard'

export default function AdminInventoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InventoryDashboard />
      </div>
    </div>
  )
}