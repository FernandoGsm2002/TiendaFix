'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { 
  Card, CardBody, CardHeader, Button, Chip, Table, TableHeader, 
  TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, 
  ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab
} from '@heroui/react'
import { 
  Users, Building, Clock, Check, X, Eye, 
  BarChart3, LogOut
} from 'lucide-react'

interface OrganizationRequest {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  address: string
  owner_name: string
  owner_email: string
  owner_phone: string
  subscription_plan: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_at?: string
  approved_by?: string
}

interface Organization {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  subscription_plan: string
  subscription_end_date: string
  created_at: string
  users_count?: number
}

export default function SuperAdminDashboard() {
  const { user, userProfile, signOut, isSuperAdmin } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<OrganizationRequest[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<OrganizationRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const supabase = createClient()

  // Verificar permisos
  useEffect(() => {
    if (!isSuperAdmin) {
      window.location.href = '/auth/login'
    }
  }, [isSuperAdmin])

  // Cargar datos
  useEffect(() => {
    if (isSuperAdmin) {
      loadData()
    }
  }, [isSuperAdmin])

  const loadData = async () => {
    setLoading(true)
    try {
      console.log('🔍 Loading admin data...')
      
      // Usar API route para evitar problemas de RLS
      const response = await fetch('/api/admin/requests')
      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Error loading data:', result.error)
        return
      }

      console.log('✅ Data loaded:', {
        requests: result.data.requests.length,
        organizations: result.data.organizations.length
      })

      setPendingRequests(result.data.requests || [])
      setOrganizations(result.data.organizations || [])
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    setActionLoading(true)
    try {
      console.log('🔄 Approving request:', requestId)
      
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Error approving request:', result.error)
        alert('Error al aprobar la solicitud: ' + result.error)
      } else {
        console.log('✅ Request approved successfully')
        alert('Solicitud aprobada exitosamente. El usuario ya puede hacer login.')
        loadData()
        onOpenChange()
      }
    } catch (error) {
      console.error('❌ Error:', error)
      alert('Error al aprobar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('organization_requests')
        .update({ 
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) {
        console.error('Error rejecting request:', error)
        alert('Error al rechazar la solicitud')
      } else {
        alert('Solicitud rechazada')
        loadData()
        onOpenChange()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al rechazar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusChip = (status: string) => {
    const statusMap = {
      pending: { color: 'warning' as const, label: 'Pendiente' },
      approved: { color: 'success' as const, label: 'Aprobada' },
      rejected: { color: 'danger' as const, label: 'Rechazada' }
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap]
    return (
      <Chip color={statusInfo.color} variant="flat" size="sm">
        {statusInfo.label}
      </Chip>
    )
  }

  const getPlanLabel = (plan: string) => {
    const planMap = {
      monthly_3: '3 Meses',
      monthly_6: '6 Meses', 
      yearly: '1 Año'
    }
    return planMap[plan as keyof typeof planMap] || plan
  }

  const stats = {
    totalRequests: pendingRequests.length,
    pendingRequests: pendingRequests.filter(r => r.status === 'pending').length,
    totalOrganizations: organizations.length,
    activeOrganizations: organizations.filter(org => 
      new Date(org.subscription_end_date) > new Date()
    ).length
  }

  if (!isSuperAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel Super Admin</h1>
                <p className="text-sm text-gray-500">TiendaFix</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button
                variant="light"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={signOut}
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tiendas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrganizations}</p>
              </div>
              <Building className="w-8 h-8 text-green-500" />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiendas Activas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeOrganizations}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultSelectedKey="requests" className="w-full">
          <Tab key="requests" title="Solicitudes Pendientes">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Solicitudes de Registro</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Solicitudes de organizaciones">
                  <TableHeader>
                    <TableColumn>TIENDA</TableColumn>
                    <TableColumn>PROPIETARIO</TableColumn>
                    <TableColumn>PLAN</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn>FECHA</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No hay solicitudes pendientes">
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.name}</p>
                            <p className="text-sm text-gray-500">{request.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.owner_name}</p>
                            <p className="text-sm text-gray-500">{request.owner_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanLabel(request.subscription_plan)}</TableCell>
                        <TableCell>{getStatusChip(request.status)}</TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="light"
                            startContent={<Eye className="w-4 h-4" />}
                            onClick={() => {
                              setSelectedRequest(request)
                              onOpen()
                            }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="organizations" title="Organizaciones">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Tiendas Registradas</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Organizaciones registradas">
                  <TableHeader>
                    <TableColumn>TIENDA</TableColumn>
                    <TableColumn>PLAN</TableColumn>
                    <TableColumn>VENCIMIENTO</TableColumn>
                    <TableColumn>CREADA</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No hay organizaciones registradas">
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-gray-500">{org.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanLabel(org.subscription_plan)}</TableCell>
                        <TableCell>
                          <div>
                            <p>{new Date(org.subscription_end_date).toLocaleDateString()}</p>
                            {new Date(org.subscription_end_date) < new Date() && (
                              <Chip color="danger" size="sm" variant="flat">Vencida</Chip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(org.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* Modal de detalles de solicitud */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Detalles de la Solicitud
              </ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Información de la Tienda</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">Nombre:</span> {selectedRequest.name}</p>
                          <p><span className="font-medium">Slug:</span> {selectedRequest.slug}</p>
                          <p><span className="font-medium">Email:</span> {selectedRequest.email}</p>
                          <p><span className="font-medium">Teléfono:</span> {selectedRequest.phone}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Propietario</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">Nombre:</span> {selectedRequest.owner_name}</p>
                          <p><span className="font-medium">Email:</span> {selectedRequest.owner_email}</p>
                          <p><span className="font-medium">Teléfono:</span> {selectedRequest.owner_phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dirección</h4>
                      <p>{selectedRequest.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Plan</h4>
                        <p>{getPlanLabel(selectedRequest.subscription_plan)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Estado</h4>
                        {getStatusChip(selectedRequest.status)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fecha de Solicitud</h4>
                      <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                {selectedRequest?.status === 'pending' && (
                  <>
                    <Button 
                      color="danger" 
                      variant="light"
                      isLoading={actionLoading}
                      onClick={() => handleRejectRequest(selectedRequest.id)}
                    >
                      Rechazar
                    </Button>
                    <Button 
                      color="success"
                      isLoading={actionLoading}
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                    >
                      Aprobar
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 