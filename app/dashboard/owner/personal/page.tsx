'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Skeleton,
  Tooltip,
  Avatar,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/react'
import FormField from '@/app/components/ui/FormField'
import { textColors } from '@/lib/utils/colors'
import { formatCurrency } from '@/lib/utils/currency'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Users,
  UserCheck,
  Shield,
  Activity,
  Calendar,
  Star,
  Target
} from 'lucide-react'

// Interfaces corregidas según el esquema real
interface Technician {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  is_active: boolean
  last_login: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  stats?: {
    totalReparaciones: number
    completadas: number
    enProceso: number
    pendientes: number
    reparacionesMes: number
    eficiencia: number
    tiempoPromedio: number
    ingrenosGenerados: number
    ultimoAcceso: string | null
  }
}

interface NewTechnicianForm {
  name: string
  email: string
  phone: string
  role: string
  password?: string
}

export default function PersonalPage() {
  const { t } = useTranslations()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const [newTechnician, setNewTechnician] = useState<NewTechnicianForm>({
    name: '',
    email: '',
    phone: '',
    role: 'technician',
    password: ''
  })

  const fetchTechnicians = async (estado = filtroEstado, rol = filtroRol, search = busqueda) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (estado !== 'todos') params.append('status', estado)
      if (rol !== 'todos') params.append('role', rol)
      if (search.trim()) params.append('search', search.trim())

      const response = await fetch(`/api/technicians?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar personal')
      }
      
      const data = await response.json()
      setTechnicians(data.data || [])
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setTechnicians([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnicians()
  }, [])

  const handleEstadoChange = (keys: any) => {
    const estado = Array.from(keys)[0] as string
    setFiltroEstado(estado)
    fetchTechnicians(estado, filtroRol, busqueda)
  }

  const handleRolChange = (keys: any) => {
    const rol = Array.from(keys)[0] as string
    setFiltroRol(rol)
    fetchTechnicians(filtroEstado, rol, busqueda)
  }

  const handleBusquedaChange = (search: string) => {
    setBusqueda(search)
    fetchTechnicians(filtroEstado, filtroRol, search)
  }

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const response = await fetch('/api/technicians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTechnician),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el técnico')
      }

      // Resetear formulario y cerrar modal
      setNewTechnician({
        name: '',
        email: '',
        phone: '',
        role: 'technician',
        password: ''
      })
      onCreateOpenChange()
      
      // Recargar la lista
      fetchTechnicians()
      
      alert('Técnico creado exitosamente')
    } catch (err) {
      console.error('Error creating technician:', err)
      alert(err instanceof Error ? err.message : 'Error al crear el técnico')
    } finally {
      setCreateLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-PE')
  }

  const getActivityStatus = (lastLogin: string | null) => {
    if (!lastLogin) return { label: 'Sin acceso', color: 'default' }
    
    const now = Date.now()
    const loginTime = new Date(lastLogin).getTime()
    const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24)
    
    if (daysDiff <= 1) return { label: 'Hoy', color: 'success' }
    if (daysDiff <= 7) return { label: 'Esta semana', color: 'primary' }
    if (daysDiff <= 30) return { label: 'Este mes', color: 'warning' }
          return { label: t('common.inactive'), color: 'danger' }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'success'
    if (efficiency >= 60) return 'warning'
    return 'danger'
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
              case 'owner': return t('staff.owner')
      case 'technician': return t('staff.technician')
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'danger'
      case 'technician': return 'primary'
      default: return 'default'
    }
  }

  const stats = {
    total: technicians.length,
    activos: technicians.filter(t => t.is_active).length,
    tecnicos: technicians.filter(t => t.role === 'technician').length,
    propietarios: technicians.filter(t => t.role === 'owner').length
  }

  // Funciones CRUD
  const handleViewDetails = (technician: Technician) => {
    setSelectedTechnician(technician)
    onDetailOpen()
  }

  const handleEditTechnician = (technician: Technician) => {
    setEditingTechnician(technician)
    onEditOpen()
  }

  const handleUpdateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTechnician) return
    
    setUpdateLoading(true)
    try {
      const response = await fetch(`/api/technicians/${editingTechnician.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTechnician),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el técnico')
      }

      onEditClose()
      fetchTechnicians()
      alert('Técnico actualizado exitosamente')
    } catch (err) {
      console.error('Error updating technician:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar el técnico')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteTechnician = (technician: Technician) => {
    setSelectedTechnician(technician)
    onDeleteOpen()
  }

  const confirmDeleteTechnician = async () => {
    if (!selectedTechnician) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/technicians/${selectedTechnician.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el técnico')
      }

      onDeleteClose()
      fetchTechnicians()
      alert('Técnico eliminado exitosamente')
    } catch (err) {
      console.error('Error deleting technician:', err)
      alert(err instanceof Error ? err.message : 'Error al eliminar el técnico')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading && technicians.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="border-danger">
          <CardBody className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-danger mx-auto" />
              <div className="text-danger-600 text-lg font-semibold">
                Error al cargar personal
              </div>
              <p className={textColors.tertiary}>{error}</p>
              <Button 
                color="danger"
                variant="flat"
                onPress={() => fetchTechnicians()}
                startContent={<TrendingUp className="w-4 h-4" />}
              >
                Reintentar
              </Button>
            </div>
          </CardBody>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
              Gestión de Personal
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              Administración de empleados y técnicos
            </p>
          </div>
          
          <Button
            color="primary"
            onPress={onCreateOpen}
            startContent={<Plus className="w-4 h-4" />}
            className="shadow-lg"
          >
            Agregar Personal
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Chip color="primary" variant="flat">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Total Personal</p>
                <p className={`text-3xl font-bold ${textColors.primary}`}>{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <Chip color="success" variant="flat">Activos</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>{t('staff.activeTechnicians')}</p>
                <p className={`text-3xl font-bold text-green-600`}>{stats.activos}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <Chip color="secondary" variant="flat">Técnicos</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>{t('staff.technician')}</p>
                <p className={`text-3xl font-bold text-purple-600`}>{stats.tecnicos}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <Chip color="secondary" variant="flat">Admins</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Propietarios</p>
                <p className={`text-3xl font-bold text-indigo-600`}>{stats.propietarios}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onValueChange={handleBusquedaChange}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                className="flex-1 min-w-[200px]"
                variant="bordered"
                classNames={{
                  input: "text-gray-900 placeholder:text-gray-500",
                  inputWrapper: "border-gray-300",
                }}
              />
              <Select
                placeholder="Filtrar por rol"
                selectedKeys={new Set([filtroRol])}
                onSelectionChange={handleRolChange}
                className="w-full sm:w-auto"
                variant="bordered"
                classNames={{
                  trigger: "text-gray-900",
                  value: "text-gray-900",
                  popoverContent: "bg-white",
                }}
              >
                <SelectItem key="todos" className="text-gray-900">Todos los roles</SelectItem>
                <SelectItem key="owner" className="text-gray-900">Propietario</SelectItem>
                <SelectItem key="technician" className="text-gray-900">Técnico</SelectItem>
              </Select>
              <Select
                placeholder="Filtrar por estado"
                selectedKeys={new Set([filtroEstado])}
                onSelectionChange={handleEstadoChange}
                className="w-full sm:w-auto"
                variant="bordered"
                classNames={{
                  trigger: "text-gray-900",
                  value: "text-gray-900",
                  popoverContent: "bg-white",
                }}
              >
                <SelectItem key="todos" className="text-gray-900">Todos los estados</SelectItem>
                                  <SelectItem key="active" className="text-gray-900">{t('common.active')}</SelectItem>
                                  <SelectItem key="inactive" className="text-gray-900">{t('common.inactive')}</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Lista de personal */}
        <Card>
          <CardBody className="p-0">
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block">
              <Table
                aria-label="Tabla de personal"
                classNames={{
                  wrapper: "min-h-[400px]",
                  th: "bg-gray-50 text-gray-700 font-semibold",
                  td: "py-4"
                }}
              >
                <TableHeader>
                  <TableColumn>EMPLEADO</TableColumn>
                  <TableColumn>CONTACTO</TableColumn>
                  <TableColumn>ROL</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>ACTIVIDAD</TableColumn>
                  <TableColumn>ESTADÍSTICAS</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No hay personal registrado">
                  {technicians.map((technician) => (
                    <TableRow key={technician.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={technician.avatar_url || undefined}
                            name={technician.name}
                            classNames={{
                              base: "bg-gradient-to-br from-blue-400 to-purple-600",
                              icon: "text-white"
                            }}
                          />
                          <div>
                            <p className={`font-semibold ${textColors.primary}`}>{technician.name}</p>
                            <p className={`text-sm ${textColors.muted}`}>
                              Registrado: {formatDate(technician.created_at)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${textColors.secondary}`}>{technician.email}</span>
                          </div>
                          {technician.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className={`text-sm ${textColors.secondary}`}>{technician.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getRoleColor(technician.role) as any}
                          variant="flat"
                          startContent={<Shield className="w-3 h-3" />}
                        >
                          {getRoleLabel(technician.role)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={technician.is_active ? 'success' : 'danger'}
                          variant="flat"
                          startContent={technician.is_active ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        >
                          {technician.is_active ? 'Activo' : 'Inactivo'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Chip
                            color={getActivityStatus(technician.last_login).color as any}
                            variant="flat"
                            size="sm"
                            startContent={<Clock className="w-3 h-3" />}
                          >
                            {getActivityStatus(technician.last_login).label}
                          </Chip>
                          <p className={`text-xs ${textColors.muted}`}>
                            {formatDate(technician.last_login)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {technician.stats ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-center p-2 bg-blue-50 rounded">
                                <p className="font-bold text-blue-600">{technician.stats.totalReparaciones}</p>
                                <p className={textColors.muted}>Total</p>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded">
                                <p className="font-bold text-green-600">{technician.stats.completadas}</p>
                                <p className={textColors.muted}>Completadas</p>
                              </div>
                            </div>
                            <Progress 
                              value={technician.stats.eficiencia} 
                              color={getEfficiencyColor(technician.stats.eficiencia) as any}
                              size="sm"
                            />
                            <p className={`text-xs ${textColors.muted} text-center`}>
                              {technician.stats.eficiencia}% eficiencia
                            </p>
                          </div>
                        ) : (
                          <p className={`text-sm ${textColors.muted}`}>Sin datos</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Ver detalles" classNames={{ content: "bg-gray-900 text-white" }}>
                            <Button isIconOnly variant="flat" size="sm" onPress={() => handleViewDetails(technician)}>
                              <Eye className="w-5 h-5" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Editar" classNames={{ content: "bg-gray-900 text-white" }}>
                            <Button isIconOnly variant="flat" size="sm" onPress={() => handleEditTechnician(technician)}>
                              <Edit className="w-5 h-5" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Eliminar" classNames={{ content: "bg-gray-900 text-white" }}>
                            <Button isIconOnly variant="flat" color="danger" size="sm" onPress={() => handleDeleteTechnician(technician)}>
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vista Móvil - Cards */}
            <div className="lg:hidden">
              {loading ? (
                <div className="space-y-4 p-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="shadow-sm">
                      <CardBody className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32 rounded" />
                              <Skeleton className="h-3 w-24 rounded" />
                            </div>
                          </div>
                          <Skeleton className="h-16 w-full rounded" />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : technicians.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className={`text-lg font-semibold ${textColors.primary} mb-2`}>
                    No hay personal
                  </h3>
                  <p className={`${textColors.muted} mb-6`}>
                    No se encontró personal registrado en el sistema
                  </p>
                  <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={onCreateOpen}>
                    Agregar Personal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {technicians.map((technician) => (
                    <Card key={technician.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardBody className="p-4">
                        {/* Header del empleado */}
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar
                            src={technician.avatar_url || undefined}
                            name={technician.name}
                            classNames={{
                              base: "bg-gradient-to-br from-blue-400 to-purple-600",
                              icon: "text-white"
                            }}
                            size="lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold ${textColors.primary} truncate`}>
                              {technician.name}
                            </h4>
                            <p className={`text-sm ${textColors.muted} mb-2`}>
                              Registrado: {formatDate(technician.created_at)}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              <Chip
                                color={getRoleColor(technician.role) as any}
                                variant="flat"
                                size="sm"
                                startContent={<Shield className="w-3 h-3" />}
                              >
                                {getRoleLabel(technician.role)}
                              </Chip>
                              <Chip
                                color={technician.is_active ? 'success' : 'danger'}
                                variant="flat"
                                size="sm"
                                startContent={technician.is_active ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              >
                                {technician.is_active ? 'Activo' : 'Inactivo'}
                              </Chip>
                            </div>
                          </div>
                        </div>

                        {/* Información de contacto */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide mb-2`}>
                            Contacto
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-600" />
                              <span className={`text-sm ${textColors.primary} truncate`}>
                                {technician.email}
                              </span>
                            </div>
                            {technician.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-600" />
                                <span className={`text-sm ${textColors.primary}`}>
                                  {technician.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actividad */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide mb-2`}>
                            Actividad
                          </p>
                          <div className="space-y-2">
                            <Chip
                              color={getActivityStatus(technician.last_login).color as any}
                              variant="flat"
                              size="sm"
                              startContent={<Clock className="w-3 h-3" />}
                            >
                              {getActivityStatus(technician.last_login).label}
                            </Chip>
                            <p className={`text-xs ${textColors.muted}`}>
                              Último acceso: {formatDate(technician.last_login)}
                            </p>
                          </div>
                        </div>

                        {/* Estadísticas */}
                        {technician.stats ? (
                          <div className="bg-green-50 rounded-lg p-3 mb-4">
                            <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide mb-3`}>
                              Estadísticas
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="text-center p-2 bg-white rounded border">
                                <p className="font-bold text-blue-600 text-lg">{technician.stats.totalReparaciones}</p>
                                <p className={`text-xs ${textColors.muted}`}>Total</p>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <p className="font-bold text-green-600 text-lg">{technician.stats.completadas}</p>
                                <p className={`text-xs ${textColors.muted}`}>Completadas</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className={`text-xs ${textColors.muted}`}>Eficiencia</span>
                                <span className={`text-xs font-medium ${textColors.primary}`}>
                                  {technician.stats.eficiencia}%
                                </span>
                              </div>
                              <Progress 
                                value={technician.stats.eficiencia} 
                                color={getEfficiencyColor(technician.stats.eficiencia) as any}
                                size="sm"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                            <p className={`text-sm ${textColors.muted}`}>Sin estadísticas disponibles</p>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <Button 
                            variant="flat" 
                            size="sm" 
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => handleViewDetails(technician)}
                            className="flex-1"
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="flat" 
                            size="sm" 
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleEditTechnician(technician)}
                            className="flex-1"
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="flat" 
                            size="sm" 
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => handleDeleteTechnician(technician)}
                            className="flex-1"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Modal para crear nuevo técnico */}
        <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Agregar Nuevo Personal</h2>
                  <p className={textColors.secondary}>Complete la información del nuevo empleado</p>
                </ModalHeader>
                <ModalBody>
                  <form onSubmit={handleCreateTechnician} className="space-y-4">
                    <FormField
                      label="Nombre Completo"
                      name="name"
                      value={newTechnician.name}
                      onChange={(value) => setNewTechnician(prev => ({ ...prev, name: value }))}
                      required
                    />
                    <FormField
                      label="Correo Electrónico"
                      name="email"
                      type="email"
                      value={newTechnician.email}
                      onChange={(value) => setNewTechnician(prev => ({ ...prev, email: value }))}
                      required
                    />
                    <FormField
                      label="Contraseña"
                      name="password"
                      type="password"
                      value={newTechnician.password || ''}
                      onChange={(value) => setNewTechnician(prev => ({ ...prev, password: value }))}
                      required
                    />
                    <FormField
                      label="Teléfono"
                      name="phone"
                      value={newTechnician.phone}
                      onChange={(value) => setNewTechnician(prev => ({ ...prev, phone: value }))}
                    />
                    <FormField
                      label="Rol"
                      name="role"
                      type="select"
                      value={newTechnician.role}
                      onChange={(value) => setNewTechnician(prev => ({ ...prev, role: value }))}
                      options={[
                        { value: 'technician', label: 'Técnico' },
                        { value: 'owner', label: 'Propietario' }
                      ]}
                      required
                    />
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                                     <Button 
                     color="primary" 
                     onPress={() => handleCreateTechnician({ preventDefault: () => {} } as any)}
                     isLoading={createLoading}
                   >
                     Crear Personal
                   </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal para ver detalles del técnico */}
        <Modal isOpen={isDetailOpen} onOpenChange={onDetailClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Detalles del Técnico</h2>
                </ModalHeader>
                <ModalBody>
                  {selectedTechnician && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={selectedTechnician.avatar_url || undefined}
                          name={selectedTechnician.name}
                          classNames={{
                            base: "bg-gradient-to-br from-blue-400 to-purple-600",
                            icon: "text-white"
                          }}
                        />
                        <div>
                          <p className={`font-semibold ${textColors.primary}`}>{selectedTechnician.name}</p>
                          <p className={`text-sm ${textColors.muted}`}>
                            Registrado: {formatDate(selectedTechnician.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className={`text-sm font-medium ${textColors.secondary}`}>Correo Electrónico: {selectedTechnician.email}</p>
                        {selectedTechnician.phone && (
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Teléfono: {selectedTechnician.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className={`text-sm font-medium ${textColors.secondary}`}>Rol: {getRoleLabel(selectedTechnician.role)}</p>
                        <Chip
                          color={getRoleColor(selectedTechnician.role) as any}
                          variant="flat"
                          startContent={<Shield className="w-3 h-3" />}
                        >
                          {getRoleLabel(selectedTechnician.role)}
                        </Chip>
                      </div>
                      <div className="space-y-2">
                        <p className={`text-sm font-medium ${textColors.secondary}`}>Estado: {selectedTechnician.is_active ? 'Activo' : 'Inactivo'}</p>
                        <Chip
                          color={selectedTechnician.is_active ? 'success' : 'danger'}
                          variant="flat"
                          startContent={selectedTechnician.is_active ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        >
                          {selectedTechnician.is_active ? 'Activo' : 'Inactivo'}
                        </Chip>
                      </div>
                      <div className="space-y-2">
                        <p className={`text-sm font-medium ${textColors.secondary}`}>Último acceso: {formatDate(selectedTechnician.last_login)}</p>
                        <Chip
                          color={getActivityStatus(selectedTechnician.last_login).color as any}
                          variant="flat"
                          size="sm"
                          startContent={<Clock className="w-3 h-3" />}
                        >
                          {getActivityStatus(selectedTechnician.last_login).label}
                        </Chip>
                      </div>
                      {selectedTechnician.stats && (
                        <div className="space-y-2">
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Estadísticas</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <p className="font-bold text-blue-600">{selectedTechnician.stats.totalReparaciones}</p>
                              <p className={textColors.muted}>Total</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="font-bold text-green-600">{selectedTechnician.stats.completadas}</p>
                              <p className={textColors.muted}>Completadas</p>
                            </div>
                          </div>
                          <Progress 
                            value={selectedTechnician.stats.eficiencia} 
                            color={getEfficiencyColor(selectedTechnician.stats.eficiencia) as any}
                            size="sm"
                          />
                          <p className={`text-xs ${textColors.muted} text-center`}>
                            {selectedTechnician.stats.eficiencia}% eficiencia
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal para editar técnico */}
        <Modal isOpen={isEditOpen} onOpenChange={onEditClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Editar Personal</h2>
                </ModalHeader>
                <ModalBody>
                  {editingTechnician && (
                    <form id="edit-technician-form" onSubmit={handleUpdateTechnician} className="space-y-4">
                      <FormField
                        label="Nombre Completo"
                        name="name"
                        value={editingTechnician.name}
                        onChange={(value) => setEditingTechnician(prev => prev ? { ...prev, name: value } : null)}
                        required
                      />
                      <FormField
                        label="Correo Electrónico"
                        name="email"
                        type="email"
                        value={editingTechnician.email}
                        onChange={(value) => setEditingTechnician(prev => prev ? { ...prev, email: value } : null)}
                        required
                      />
                      <FormField
                        label="Teléfono"
                        name="phone"
                        value={editingTechnician.phone || ''}
                        onChange={(value) => setEditingTechnician(prev => prev ? { ...prev, phone: value } : null)}
                      />
                      <FormField
                        label="Rol"
                        name="role"
                        type="select"
                        value={editingTechnician.role}
                        onChange={(value) => setEditingTechnician(prev => prev ? { ...prev, role: value } : null)}
                        options={[
                          { value: 'technician', label: 'Técnico' },
                          { value: 'owner', label: 'Propietario' }
                        ]}
                        required
                      />
                    </form>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    color="primary" 
                    type="submit"
                    form="edit-technician-form"
                    isLoading={updateLoading}
                  >
                    Actualizar Personal
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal para confirmar eliminación del técnico */}
        <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Eliminar Técnico</h2>
                </ModalHeader>
                <ModalBody>
                  {selectedTechnician && (
                    <p className={`text-sm ${textColors.secondary}`}>¿Estás seguro de que quieres eliminar este técnico?</p>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={confirmDeleteTechnician}
                    isLoading={deleteLoading}
                  >
                    Eliminar Personal
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 