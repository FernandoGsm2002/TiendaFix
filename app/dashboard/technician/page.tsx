'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardBody, Button } from '@heroui/react'
import { Wrench, LogOut, Package, Users, Clipboard, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TechnicianDashboard() {
  const { userProfile, signOut } = useAuth()
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wrench className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Técnico</h1>
                <p className="text-sm text-gray-500">{userProfile?.organization_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.name}</p>
                <p className="text-xs text-gray-500">Técnico</p>
              </div>
              <Button
                variant="light"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={handleSignOut}
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming Soon Message */}
        <Card className="w-full">
          <CardBody className="text-center p-12">
            <Wrench className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Panel de Trabajo en Desarrollo
            </h2>
            <p className="text-gray-600 mb-8">
              Estamos preparando todas las herramientas que necesitas para gestionar 
              tus reparaciones y servicios técnicos de manera eficiente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <Clipboard className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-blue-900">Reparaciones Asignadas</h3>
                <p className="text-sm text-blue-700">Gestiona tus trabajos pendientes</p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <Package className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="font-semibold text-green-900">Inventario</h3>
                <p className="text-sm text-green-700">Consulta stock de repuestos</p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <Users className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-purple-900">Base de Clientes</h3>
                <p className="text-sm text-purple-700">Historial y datos de clientes</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-yellow-900 mb-2">¿Qué podrás hacer pronto?</h3>
              <ul className="text-sm text-yellow-800 text-left space-y-2">
                <li>• Ver y actualizar el estado de reparaciones</li>
                <li>• Registrar el tiempo invertido en cada trabajo</li>
                <li>• Consultar información de clientes y historial</li>
                <li>• Gestionar el inventario de repuestos y herramientas</li>
                <li>• Generar reportes de tu productividad</li>
                <li>• Comunicarte con otros técnicos del equipo</li>
              </ul>
            </div>

            <p className="text-sm text-gray-500">
              Contacta con tu administrador si necesitas acceso anticipado a alguna función.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
} 