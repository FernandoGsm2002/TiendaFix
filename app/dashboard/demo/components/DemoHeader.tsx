'use client'

import React from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { Bell, User, Settings } from 'lucide-react'

export default function DemoHeader() {
  const { t } = useTranslations()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-blue-600">
              TiendaFix - Demo
            </div>
          </div>

          {/* Acciones del header */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Menú usuario */}
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Demo User</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 