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
  BarChart3, LogOut, Copy, User
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
  const [approvedData, setApprovedData] = useState<any>(null)
  
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isOpen: isApprovedOpen, onOpen: onApprovedOpen, onOpenChange: onApprovedOpenChange } = useDisclosure()
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
        
        // Mostrar modal con datos de acceso
        setApprovedData({
          organization: result.data.organization,
          user: result.data.user,
          authUser: result.data.authUser,
          temporaryPassword: result.data.authUser.temporaryPassword
        })
        
        loadData()
        onOpenChange() // Cerrar modal de detalles
        onApprovedOpen() // Abrir modal de datos de acceso
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copiado al portapapeles`)
    } catch (err) {
      console.error('Error al copiar:', err)
      alert('Error al copiar al portapapeles')
    }
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
              <Building className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel Super Admin</h1>
                <p className="text-sm text-gray-600">TiendaFix</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <Button
                variant="flat"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={signOut}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tiendas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrganizations}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardBody className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiendas Activas</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeOrganizations}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs 
          defaultSelectedKey="requests" 
          className="w-full"
          classNames={{
            tabList: "bg-white border border-gray-200 rounded-lg p-1",
            tab: "text-gray-600 data-[selected=true]:text-blue-600 data-[selected=true]:bg-blue-50",
            tabContent: "group-data-[selected=true]:text-blue-600 font-medium",
            panel: "pt-4"
          }}
        >
          <Tab key="requests" title="Solicitudes Pendientes" className="text-gray-700">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Registro</h3>
              </CardHeader>
              <CardBody className="p-0">
                <Table 
                  aria-label="Solicitudes de organizaciones"
                  classNames={{
                    wrapper: "shadow-none",
                    th: "bg-gray-50 text-gray-700 font-semibold",
                    td: "text-gray-700",
                  }}
                >
                  <TableHeader>
                    <TableColumn className="text-gray-700 font-semibold">TIENDA</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">PROPIETARIO</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">PLAN</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">ESTADO</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">FECHA</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No hay solicitudes pendientes">
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{request.name}</p>
                            <p className="text-sm text-gray-600">{request.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{request.owner_name}</p>
                            <p className="text-sm text-gray-600">{request.owner_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-800">{getPlanLabel(request.subscription_plan)}</span>
                        </TableCell>
                        <TableCell>{getStatusChip(request.status)}</TableCell>
                        <TableCell>
                          <span className="text-gray-800">{new Date(request.created_at).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            startContent={<Eye className="w-4 h-4" />}
                            onClick={() => {
                              setSelectedRequest(request)
                              onOpen()
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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

          <Tab key="organizations" title="Organizaciones" className="text-gray-700">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Tiendas Registradas</h3>
              </CardHeader>
              <CardBody className="p-0">
                <Table 
                  aria-label="Organizaciones registradas"
                  classNames={{
                    wrapper: "shadow-none",
                    th: "bg-gray-50 text-gray-700 font-semibold",
                    td: "text-gray-700",
                  }}
                >
                  <TableHeader>
                    <TableColumn className="text-gray-700 font-semibold">TIENDA</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">PLAN</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">VENCIMIENTO</TableColumn>
                    <TableColumn className="text-gray-700 font-semibold">CREADA</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No hay organizaciones registradas">
                    {organizations.map((org) => (
                      <TableRow key={org.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{org.name}</p>
                            <p className="text-sm text-gray-600">{org.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-800">{getPlanLabel(org.subscription_plan)}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-gray-800">{new Date(org.subscription_end_date).toLocaleDateString()}</p>
                            {new Date(org.subscription_end_date) < new Date() && (
                              <Chip color="danger" size="sm" variant="flat">Vencida</Chip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-800">{new Date(org.created_at).toLocaleDateString()}</span>
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
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          wrapper: "z-[1000]",
          backdrop: "z-[999]",
          base: "max-h-[95vh] my-2 mx-2 sm:mx-6",
          body: "max-h-[75vh] overflow-y-auto py-4",
          header: "border-b border-gray-200 pb-4",
          footer: "border-t border-gray-200 pt-4"
        }}
      >
        <ModalContent className="bg-white">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Detalles de la Solicitud</h2>
              </ModalHeader>
              <ModalBody className="p-6">
                {selectedRequest && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          Información de la Tienda
                        </h4>
                        <div className="space-y-2">
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Nombre:</span> {selectedRequest.name}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Slug:</span> {selectedRequest.slug}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Email:</span> {selectedRequest.email}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Teléfono:</span> {selectedRequest.phone}</p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Propietario
                        </h4>
                        <div className="space-y-2">
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Nombre:</span> {selectedRequest.owner_name}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Email:</span> {selectedRequest.owner_email}</p>
                          <p className="text-gray-700"><span className="font-medium text-gray-900">Teléfono:</span> {selectedRequest.owner_phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-3">Dirección</h4>
                      <p className="text-gray-700">{selectedRequest.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-3">Plan de Suscripción</h4>
                        <p className="text-gray-700">{getPlanLabel(selectedRequest.subscription_plan)}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Estado Actual</h4>
                        {getStatusChip(selectedRequest.status)}
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-3">Fecha de Solicitud</h4>
                      <p className="text-gray-700">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="bg-gray-50 border-t border-gray-200">
                <Button 
                  variant="flat" 
                  onPress={onClose}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  Cerrar
                </Button>
                {selectedRequest?.status === 'pending' && (
                  <>
                    <Button 
                      color="danger" 
                      variant="flat"
                      isLoading={actionLoading}
                      onClick={() => handleRejectRequest(selectedRequest.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Rechazar
                    </Button>
                    <Button 
                      color="success"
                      variant="solid"
                      isLoading={actionLoading}
                      onClick={() => handleApproveRequest(selectedRequest.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
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

      {/* Modal de datos de acceso después de aprobación */}
      <Modal 
        isOpen={isApprovedOpen} 
        onOpenChange={onApprovedOpenChange} 
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          wrapper: "z-[1000]",
          backdrop: "z-[999]",
          base: "max-h-[95vh] my-2 mx-2 sm:mx-6",
          body: "max-h-[80vh] overflow-y-auto py-4",
          header: "border-b border-gray-200 pb-4",
          footer: "border-t border-gray-200 pt-4"
        }}
      >
        <ModalContent className="bg-white">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-green-50 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-green-800 font-bold text-lg">¡Solicitud Aprobada Exitosamente!</span>
                </div>
              </ModalHeader>
              <ModalBody>
                {approvedData && (
                  <div className="space-y-6">
                    {/* Información crítica */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <h4 className="font-bold text-amber-800">⚠️ INFORMACIÓN CRÍTICA PARA EL USUARIO</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-amber-700">Email de acceso:</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-mono font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded flex-1">
                                {approvedData.authUser.email}
                              </p>
                              <Button
                                size="sm"
                                variant="light"
                                color="warning"
                                onClick={() => copyToClipboard(approvedData.authUser.email, 'Email')}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-700">Contraseña temporal:</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-mono font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded flex-1">
                                {approvedData.temporaryPassword}
                              </p>
                              <Button
                                size="sm"
                                variant="light"
                                color="warning"
                                onClick={() => copyToClipboard(approvedData.temporaryPassword, 'Contraseña')}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <strong>Instrucciones para el usuario:</strong> Debe usar estas credenciales para su primer acceso. 
                            Es altamente recomendable cambiar la contraseña después del primer login.
                          </p>
                        </div>
                        <div className="flex justify-center pt-2">
                          <Button
                            color="warning"
                            variant="flat"
                            startContent={<Copy className="w-4 h-4" />}
                            onClick={() => {
                              const accessInfo = `🔐 Datos de acceso a TiendaFix
                              
📧 Email: ${approvedData.authUser.email}
🔑 Contraseña temporal: ${approvedData.temporaryPassword}
🌐 URL de acceso: ${window.location.origin}/auth/login

⚠️ IMPORTANTE: Cambie la contraseña después del primer acceso por seguridad.

¡Bienvenido a TiendaFix! 🎉`
                              copyToClipboard(accessInfo, 'Información de acceso completa')
                            }}
                          >
                            Copiar toda la información
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Información de la organización */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-800 mb-3">📋 Información de la Tienda</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Nombre:</p>
                          <p className="text-blue-900">{approvedData.organization.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Slug:</p>
                          <p className="text-blue-900">{approvedData.organization.slug}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Email:</p>
                          <p className="text-blue-900">{approvedData.organization.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">Plan:</p>
                          <p className="text-blue-900">{getPlanLabel(approvedData.organization.subscription_plan)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Información del propietario */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-800 mb-3">👤 Información del Propietario</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-green-700">Nombre:</p>
                          <p className="text-green-900">{approvedData.user.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Email:</p>
                          <p className="text-green-900">{approvedData.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Rol:</p>
                          <p className="text-green-900">Propietario</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">ID de Usuario:</p>
                          <p className="text-green-900 font-mono text-sm">{approvedData.user.id}</p>
                        </div>
                      </div>
                    </div>

                    {/* URL de acceso */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-bold text-purple-800 mb-3">🌐 URL de Acceso</h4>
                      <p className="text-purple-900">
                        El usuario puede acceder al sistema en: 
                        <span className="font-mono font-bold"> {window.location.origin}/auth/login</span>
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="bg-gray-50 border-t border-gray-200">
                <Button 
                  color="primary" 
                  variant="solid"
                  onPress={onClose} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Entendido - Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 