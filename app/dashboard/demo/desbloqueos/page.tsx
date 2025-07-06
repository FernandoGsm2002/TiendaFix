'use client'

import React, { useState } from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_UNLOCKS } from '@/lib/demo/data'
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
  Progress
} from '@heroui/react'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Unlock, 
  Smartphone, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  DollarSign,
  Hash,
  Zap,
  Key,
  Settings
} from 'lucide-react'

export default function DemoDesbloqueos() {
  const { t } = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [selectedUnlock, setSelectedUnlock] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredUnlocks = DEMO_UNLOCKS.filter(unlock => {
    const matchesSearch = unlock.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unlock.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unlock.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unlock.imei.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || unlock.status === statusFilter
    const matchesBrand = brandFilter === 'all' || unlock.brand === brandFilter
    
    return matchesSearch && matchesStatus && matchesBrand
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'pending': return 'warning'
      case 'failed': return 'danger'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado'
      case 'in_progress': return 'En Progreso'
      case 'pending': return 'Pendiente'
      case 'failed': return 'Fallido'
      default: return status
    }
  }

  const getUnlockTypeIcon = (type: string) => {
    switch (type) {
      case 'Network Unlock': return Unlock
      case 'iCloud Bypass': return Shield
      case 'Bootloader Unlock': return Settings
      case 'FRP Bypass': return Key
      default: return Unlock
    }
  }

  const getUnlockTypeColor = (type: string) => {
    switch (type) {
      case 'Network Unlock': return 'primary'
      case 'iCloud Bypass': return 'warning'
      case 'Bootloader Unlock': return 'secondary'
      case 'FRP Bypass': return 'success'
      default: return 'default'
    }
  }

  const getBrandIcon = (brand: string) => {
    return Smartphone // Usamos el mismo icono para todas las marcas
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString()}`
  }

  const viewUnlockDetails = (unlock: any) => {
    setSelectedUnlock(unlock)
    onOpen()
  }

  const getTimeElapsed = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    
    if (diffDays > 1) return `${diffDays} días`
    return `${diffHours} horas`
  }

  const unlockStats = {
    totalUnlocks: DEMO_UNLOCKS.length,
    completedUnlocks: DEMO_UNLOCKS.filter(u => u.status === 'completed').length,
    inProgressUnlocks: DEMO_UNLOCKS.filter(u => u.status === 'in_progress').length,
    pendingUnlocks: DEMO_UNLOCKS.filter(u => u.status === 'pending').length,
    totalRevenue: DEMO_UNLOCKS.reduce((sum, unlock) => sum + unlock.cost, 0),
    avgCost: DEMO_UNLOCKS.reduce((sum, unlock) => sum + unlock.cost, 0) / DEMO_UNLOCKS.length
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestión de Desbloqueos
          </h1>
          <p className="text-gray-600 mt-1">
            Administra desbloqueos de dispositivos móviles
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
            Nuevo Desbloqueo
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Unlock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Desbloqueos</p>
                <p className="text-2xl font-bold text-gray-900">{unlockStats.totalUnlocks}</p>
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
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{unlockStats.completedUnlocks}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">{unlockStats.inProgressUnlocks}</p>
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
                <p className="text-2xl font-bold text-gray-900">{unlockStats.pendingUnlocks}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(unlockStats.totalRevenue)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3 rounded-xl">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Costo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(unlockStats.avgCost)}</p>
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
                placeholder="Buscar por cliente, marca, modelo o IMEI..."
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
                <SelectItem key="in_progress">En progreso</SelectItem>
                <SelectItem key="completed">Completados</SelectItem>
                <SelectItem key="failed">Fallidos</SelectItem>
              </Select>
              <Select 
                placeholder="Marca" 
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="all">Todas las marcas</SelectItem>
                <SelectItem key="Samsung">Samsung</SelectItem>
                <SelectItem key="iPhone">iPhone</SelectItem>
                <SelectItem key="Xiaomi">Xiaomi</SelectItem>
                <SelectItem key="Huawei">Huawei</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabla de desbloqueos */}
      <Card className="shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Desbloqueos ({filteredUnlocks.length})
            </h2>
            <Chip color="primary" variant="flat" size="sm">
              Solo visualización
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Tabla de desbloqueos">
            <TableHeader>
              <TableColumn>CLIENTE</TableColumn>
              <TableColumn>DISPOSITIVO</TableColumn>
              <TableColumn>TIPO DESBLOQUEO</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>PROVEEDOR</TableColumn>
              <TableColumn>COSTO</TableColumn>
              <TableColumn>TIEMPO</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredUnlocks.map((unlock) => {
                const UnlockIcon = getUnlockTypeIcon(unlock.unlock_type)
                const BrandIcon = getBrandIcon(unlock.brand)
                
                return (
                  <TableRow key={unlock.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{unlock.customer_name}</p>
                          <p className="text-sm text-gray-500">{formatDate(unlock.created_at)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BrandIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{unlock.brand} {unlock.model}</p>
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 font-mono">{unlock.imei}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UnlockIcon className="h-4 w-4 text-purple-600" />
                        <Chip 
                          color={getUnlockTypeColor(unlock.unlock_type)}
                          variant="flat"
                          size="sm"
                        >
                          {unlock.unlock_type}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={getStatusColor(unlock.status)}
                        variant="flat"
                        size="sm"
                      >
                        {getStatusLabel(unlock.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{unlock.provider}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(unlock.cost)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {getTimeElapsed(unlock.created_at, unlock.completion_date)}
                        </p>
                        <p className="text-gray-500">
                          {unlock.status === 'completed' ? 'completado' : 'transcurrido'}
                        </p>
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
                            onPress={() => viewUnlockDetails(unlock)}
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
                )
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal de detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {selectedUnlock && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-blue-600">Detalles del Desbloqueo</h2>
                <p className="text-sm text-gray-500">ID: {selectedUnlock.id}</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 p-4 rounded-xl">
                      {(() => {
                        const UnlockIcon = getUnlockTypeIcon(selectedUnlock.unlock_type)
                        return <UnlockIcon className="h-8 w-8 text-purple-600" />
                      })()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedUnlock.unlock_type}
                      </h3>
                      <p className="text-gray-600">{selectedUnlock.brand} {selectedUnlock.model}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip 
                          color={getStatusColor(selectedUnlock.status)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(selectedUnlock.status)}
                        </Chip>
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600 font-mono">{selectedUnlock.imei}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Información del Cliente</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cliente:</span>
                          <span className="font-medium">{selectedUnlock.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha de solicitud:</span>
                          <span className="font-medium">{formatDate(selectedUnlock.created_at)}</span>
                        </div>
                        {selectedUnlock.completion_date && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de completado:</span>
                            <span className="font-medium">{formatDate(selectedUnlock.completion_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Detalles del Servicio</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Proveedor:</span>
                          <span className="font-medium">{selectedUnlock.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Costo:</span>
                          <span className="font-medium">{formatCurrency(selectedUnlock.cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tiempo transcurrido:</span>
                          <span className="font-medium">
                            {getTimeElapsed(selectedUnlock.created_at, selectedUnlock.completion_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dispositivo</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Marca y Modelo:</p>
                          <p className="font-medium text-gray-900">{selectedUnlock.brand} {selectedUnlock.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">IMEI:</p>
                          <p className="font-medium text-gray-900 font-mono">{selectedUnlock.imei}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedUnlock.status === 'in_progress' && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Progreso</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado actual:</span>
                          <span className="font-medium text-blue-600">En proceso</span>
                        </div>
                        <Progress 
                          value={65} 
                          color="primary"
                          size="sm"
                          label="Progreso estimado"
                        />
                        <p className="text-sm text-gray-500">
                          Tiempo estimado restante: 24-48 horas
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedUnlock.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedUnlock.notes}</p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" className="cursor-not-allowed opacity-50" disabled>
                  Editar Desbloqueo
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 