'use client'

import React, { useState } from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_TECHNICIANS } from '@/lib/demo/data'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar,
  Progress
} from '@heroui/react'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Wrench, 
  Star, 
  CheckCircle, 
  XCircle,
  Award,
  Target,
  TrendingUp,
  Users
} from 'lucide-react'

export default function DemoPersonalPage() {
  const { t } = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredTechnicians = DEMO_TECHNICIANS.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || tech.status === statusFilter
    const matchesRole = roleFilter === 'all' || tech.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'danger'
      case 'busy': return 'warning'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'inactive': return 'Inactivo'
      case 'busy': return 'Ocupado'
      default: return status
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'technician': return 'Técnico'
      case 'senior_technician': return 'Técnico Senior'
      case 'supervisor': return 'Supervisor'
      default: return role
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const viewTechnicianDetails = (technician: any) => {
    setSelectedTechnician(technician)
    onOpen()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-yellow-600'
    if (rating >= 3.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const technicianStats = {
    total: DEMO_TECHNICIANS.length,
    active: DEMO_TECHNICIANS.filter(t => t.status === 'active').length,
    inactive: DEMO_TECHNICIANS.filter(t => t.status === 'inactive').length,
    avgRating: DEMO_TECHNICIANS.reduce((sum, t) => sum + t.rating, 0) / DEMO_TECHNICIANS.length,
    totalRepairs: DEMO_TECHNICIANS.reduce((sum, t) => sum + t.total_repairs, 0),
    avgExperience: DEMO_TECHNICIANS.reduce((sum, t) => sum + t.experience_years, 0) / DEMO_TECHNICIANS.length
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestión de Personal
          </h1>
          <p className="text-gray-600 mt-1">
            Administra técnicos y equipo de trabajo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Chip 
            color="warning" 
            variant="flat" 
            size="lg"
            className="font-semibold"
          >
            🎭 MODO DEMO
          </Chip>
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            className="font-semibold cursor-not-allowed"
            disabled
          >
            Nuevo Técnico
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Personal</p>
                <p className="text-2xl font-bold text-gray-900">{technicianStats.total}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{technicianStats.active}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-400 to-red-600 p-3 rounded-xl">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">{technicianStats.inactive}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded-xl">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{technicianStats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Reparaciones</p>
                <p className="text-2xl font-bold text-gray-900">{technicianStats.totalRepairs}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3 rounded-xl">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Experiencia Prom.</p>
                <p className="text-2xl font-bold text-gray-900">{technicianStats.avgExperience.toFixed(1)} años</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, email o especialización..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="h-4 w-4 text-gray-400" />}
                variant="bordered"
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Select 
                placeholder="Estado" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="all">Todos los estados</SelectItem>
                <SelectItem key="active">Activos</SelectItem>
                <SelectItem key="inactive">Inactivos</SelectItem>
                <SelectItem key="busy">Ocupados</SelectItem>
              </Select>
              <Select 
                placeholder="Rol" 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="all">Todos los roles</SelectItem>
                <SelectItem key="technician">Técnico</SelectItem>
                <SelectItem key="senior_technician">Técnico Senior</SelectItem>
                <SelectItem key="supervisor">Supervisor</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabla de técnicos */}
      <Card className="shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-900">
              Equipo Técnico ({filteredTechnicians.length})
            </h2>
            <Chip color="primary" variant="flat" size="sm">
              Solo visualización
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Tabla de técnicos">
            <TableHeader>
              <TableColumn>TÉCNICO</TableColumn>
              <TableColumn>CONTACTO</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>ESPECIALIZACIÓN</TableColumn>
              <TableColumn>EXPERIENCIA</TableColumn>
              <TableColumn>RATING</TableColumn>
              <TableColumn>REPARACIONES</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredTechnicians.map((technician) => (
                <TableRow key={technician.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar 
                        name={getInitials(technician.name)}
                        size="md"
                        className="bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{technician.name}</p>
                        <p className="text-sm text-gray-500">{getRoleLabel(technician.role)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{technician.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{technician.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(technician.status)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusLabel(technician.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {technician.specializations.slice(0, 2).map((spec, index) => (
                        <Chip 
                          key={index} 
                          variant="flat" 
                          size="sm"
                          className="text-xs"
                        >
                          {spec}
                        </Chip>
                      ))}
                      {technician.specializations.length > 2 && (
                        <Chip variant="flat" size="sm" className="text-xs">
                          +{technician.specializations.length - 2}
                        </Chip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{technician.experience_years}</p>
                      <p className="text-xs text-gray-500">años</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className={`font-medium ${getRatingColor(technician.rating)}`}>
                        {technician.rating}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{technician.total_repairs}</p>
                      <p className="text-xs text-gray-500">completadas</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Ver detalles" color="primary">
                        <Button
                          isIconOnly
                          variant="ghost"
                          color="primary"
                          size="sm"
                          onPress={() => viewTechnicianDetails(technician)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Editar (Demo)" color="warning">
                        <Button
                          isIconOnly
                          variant="ghost"
                          color="warning"
                          size="sm"
                          className="cursor-not-allowed opacity-50"
                          disabled
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal de detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {selectedTechnician && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Perfil del Técnico</h2>
                <p className="text-sm text-gray-500">ID: {selectedTechnician.id}</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      name={getInitials(selectedTechnician.name)}
                      size="lg"
                      className="bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedTechnician.name}
                      </h3>
                      <p className="text-gray-600">{getRoleLabel(selectedTechnician.role)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip 
                          color={getStatusColor(selectedTechnician.status)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(selectedTechnician.status)}
                        </Chip>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{selectedTechnician.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Información de Contacto</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{selectedTechnician.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{selectedTechnician.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">Desde: {formatDate(selectedTechnician.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Estadísticas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experiencia:</span>
                          <span className="font-medium">{selectedTechnician.experience_years} años</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reparaciones:</span>
                          <span className="font-medium">{selectedTechnician.total_repairs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{selectedTechnician.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Especializaciones</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTechnician.specializations.map((spec: string, index: number) => (
                        <Chip 
                          key={index} 
                          variant="flat" 
                          color="primary"
                          size="sm"
                        >
                          {spec}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Rendimiento</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Calidad del trabajo</span>
                          <span className="text-sm font-medium">{((selectedTechnician.rating / 5) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={(selectedTechnician.rating / 5) * 100} 
                          color="success"
                          size="sm"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Productividad</span>
                          <span className="text-sm font-medium">{Math.min(100, (selectedTechnician.total_repairs / 10)).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(100, (selectedTechnician.total_repairs / 10))} 
                          color="primary"
                          size="sm"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Experiencia</span>
                          <span className="text-sm font-medium">{Math.min(100, (selectedTechnician.experience_years / 10) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(100, (selectedTechnician.experience_years / 10) * 100)} 
                          color="warning"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" className="cursor-not-allowed opacity-50" disabled>
                  Editar Técnico
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 