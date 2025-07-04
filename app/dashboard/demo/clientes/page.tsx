'use client'

import React from 'react'
import DemoLayout from '../components/DemoLayout'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_CUSTOMERS } from '@/lib/demo/data'
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Clock,
  Plus
} from 'lucide-react'

export default function ClientesDemo() {
  const { t } = useTranslations()

  return (
    <DemoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('sidebar.customers')}
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión de clientes - Modo Demo
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-orange-700">
                  SOLO VISUALIZACIÓN
                </span>
              </div>
              <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg flex items-center space-x-2 cursor-not-allowed">
                <Plus className="h-4 w-4" />
                <span>Agregar Cliente</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Clientes
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {DEMO_CUSTOMERS.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Recurrentes
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {DEMO_CUSTOMERS.filter(c => c.is_recurrent).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Nuevos (Este mes)
                </p>
                <p className="text-xl font-bold text-gray-900">
                  3
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Clientes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {DEMO_CUSTOMERS.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name || 'Cliente Anónimo'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.notes}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.customer_type === 'identified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.customer_type === 'identified' ? 'Identificado' : 'Anónimo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.is_recurrent 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.is_recurrent ? 'Recurrente' : 'Nuevo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 cursor-not-allowed">
                          Ver
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 cursor-not-allowed">
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DemoLayout>
  )
} 