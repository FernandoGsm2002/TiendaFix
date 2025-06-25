'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardBody, Button } from '@heroui/react'
import { Clock, Mail, Phone, LogOut } from 'lucide-react'

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardBody className="text-center p-8">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Solicitud en Revisión
            </h1>
            
            <p className="text-gray-600 mb-6">
              Tu solicitud de registro está siendo revisada por nuestro equipo. 
              Te notificaremos por email cuando sea aprobada.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-900 mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-yellow-800 text-left space-y-1">
                <li>• Revisamos tu solicitud en 24-48 horas</li>
                <li>• Te contactamos por email con el resultado</li>
                <li>• Una vez aprobada, podrás acceder a tu panel</li>
                <li>• Recibirás las credenciales de acceso</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Información de contacto</h4>
              <p className="text-sm text-gray-600">
                Cuenta registrada: <span className="font-medium">{user?.email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>soporte@tiendafix.com</span>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>+51 999 888 777</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="light"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={signOut}
                className="w-full"
              >
                Cerrar Sesión
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
} 