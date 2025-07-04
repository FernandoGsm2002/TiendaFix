'use client'

import React, { useState } from 'react'

import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_REPAIRS } from '@/lib/demo/data'
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
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Smartphone, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  AlertTriangle
} from 'lucide-react'

export default function DemoReparacionesPage() {
  const { t } = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedRepair, setSelectedRepair] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredRepairs = DEMO_REPAIRS.filter(repair => {
    const matchesSearch = repair.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repair.device_info.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || repair.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      case 'delivered': return 'success'
      case 'diagnosed': return 'secondary'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'in_progress': return 'En Progreso'
      case 'completed': return 'Completada'
      case 'delivered': return 'Entregada'
      case 'diagnosed': return 'Diagnosticada'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'urgent': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baja'
      case 'medium': return 'Media'
      case 'high': return 'Alta'
      case 'urgent': return 'Urgente'
      default: return priority
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const viewRepairDetails = (repair: any) => {
    setSelectedRepair(repair)
    onOpen()
  }

  const statusStats = {
    total: DEMO_REPAIRS.length,
    pending: DEMO_REPAIRS.filter(r => r.status === 'pending').length,
    in_progress: DEMO_REPAIRS.filter(r => r.status === 'in_progress').length,
    completed: DEMO_REPAIRS.filter(r => r.status === 'completed').length,
    delivered: DEMO_REPAIRS.filter(r => r.status === 'delivered').length,
    diagnosed: DEMO_REPAIRS.filter(r => r.status === 'diagnosed').length
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestión de Reparaciones
          </h1>
          <p className="text-gray-600 mt-1">
            Administra todas las reparaciones en proceso
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
            Nueva Reparación
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{statusStats.total}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{statusStats.pending}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">{statusStats.in_progress}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Diagnosticadas</p>
                <p className="text-2xl font-bold text-gray-900">{statusStats.diagnosed}</p>
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
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{statusStats.completed}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3 rounded-xl">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Entregadas</p>
                <p className="text-2xl font-bold text-gray-900">{statusStats.delivered}</p>
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
                placeholder="Buscar por cliente, dispositivo o descripción..."
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
                <SelectItem key="pending">Pendientes</SelectItem>
                <SelectItem key="in_progress">En Progreso</SelectItem>
                <SelectItem key="diagnosed">Diagnosticadas</SelectItem>
                <SelectItem key="completed">Completadas</SelectItem>
                <SelectItem key="delivered">Entregadas</SelectItem>
              </Select>
              <Select 
                placeholder="Prioridad" 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="all">Todas las prioridades</SelectItem>
                <SelectItem key="low">Baja</SelectItem>
                <SelectItem key="medium">Media</SelectItem>
                <SelectItem key="high">Alta</SelectItem>
                <SelectItem key="urgent">Urgente</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabla de reparaciones */}
      <Card className="shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Reparaciones ({filteredRepairs.length})
            </h2>
            <Chip color="primary" variant="flat" size="sm">
              Solo visualización
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Tabla de reparaciones">
            <TableHeader>
              <TableColumn>CLIENTE</TableColumn>
              <TableColumn>DISPOSITIVO</TableColumn>
              <TableColumn>PROBLEMA</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>PRIORIDAD</TableColumn>
              <TableColumn>TÉCNICO</TableColumn>
              <TableColumn>COSTO</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredRepairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{repair.customer_name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(repair.received_date)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{repair.device_info}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{repair.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {repair.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={getStatusColor(repair.status)}
                      variant="flat"
                      size="sm"
                    >
                      {getStatusLabel(repair.status)}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getPriorityColor(repair.priority)}`}>
                      {getPriorityLabel(repair.priority)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {repair.technician ? (
                        <>
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-900 font-medium">{repair.technician}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Sin asignar</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-900">S/ {repair.cost}</span>
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
                          onPress={() => viewRepairDetails(repair)}
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
          {selectedRepair && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">Detalles de la Reparación</h2>
                <p className="text-sm text-gray-500">ID: {selectedRepair.id}</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cliente</h4>
                      <p className="text-gray-700">{selectedRepair.customer_name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Dispositivo</h4>
                      <p className="text-gray-700">{selectedRepair.device_info}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Estado</h4>
                      <Chip 
                        color={getStatusColor(selectedRepair.status)}
                        variant="flat"
                      >
                        {getStatusLabel(selectedRepair.status)}
                      </Chip>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Prioridad</h4>
                      <span className={`font-medium ${getPriorityColor(selectedRepair.priority)}`}>
                        {getPriorityLabel(selectedRepair.priority)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Técnico Asignado</h4>
                      <p className="text-gray-700">{selectedRepair.technician || 'Sin asignar'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Costo</h4>
                      <p className="text-gray-700 font-medium">S/ {selectedRepair.cost}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Descripción del Problema</h4>
                    <p className="text-gray-700">{selectedRepair.problem_description}</p>
                  </div>
                  
                  {selectedRepair.solution_description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Solución Aplicada</h4>
                      <p className="text-gray-700">{selectedRepair.solution_description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fecha de Recepción</h4>
                      <p className="text-gray-700">{formatDate(selectedRepair.received_date)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Días Estimados</h4>
                      <p className="text-gray-700">{selectedRepair.estimated_days} días</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Garantía</h4>
                      <p className="text-gray-700">{selectedRepair.warranty_days} días</p>
                    </div>
                    {selectedRepair.delivery_date && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Fecha de Entrega</h4>
                        <p className="text-gray-700">{formatDate(selectedRepair.delivery_date)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" className="cursor-not-allowed opacity-50" disabled>
                  Editar Reparación
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 