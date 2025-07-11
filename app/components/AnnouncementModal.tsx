'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  ScrollShadow,
  useDisclosure
} from '@heroui/react'
import { 
  X, 
  Sparkles, 
  Calendar, 
  Tag, 
  CheckCircle,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react'
import { textColors } from '@/lib/utils/colors'
import {
  type VersionInfo,
  getLatestVersion,
  shouldShowAnnouncement,
  getChangeTypeLabel,
  getChangeTypeColor,
  getChangeIcon,
  getPriorityLabel,
  getPriorityColor
} from '@/lib/utils/changelog'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  version: VersionInfo
  onMarkAsSeen: (version: string) => void
}

export function AnnouncementModal({ 
  isOpen, 
  onClose, 
  version, 
  onMarkAsSeen 
}: AnnouncementModalProps) {
  const handleClose = () => {
    onMarkAsSeen(version.version)
    onClose()
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />
      case 'medium':
        return <Star className="w-4 h-4" />
      case 'low':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
      hideCloseButton
      backdrop="blur"
      classNames={{
        wrapper: "z-[1100]",
        backdrop: "z-[1099] bg-black/50 backdrop-blur-sm",
        base: "max-h-[90vh] my-4 mx-4 sm:mx-6 border-2 border-gray-200 shadow-2xl",
        body: "max-h-[60vh] overflow-y-auto py-4",
        header: "border-b border-gray-200 pb-4",
        footer: "border-t border-gray-200 pt-4 bg-gray-50"
      }}
    >
      <ModalContent className="bg-white">
        <ModalHeader className="flex flex-col gap-3 bg-gradient-to-r from-[#4ca771] to-[#013237] text-white rounded-t-lg p-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  ¡Nuevas Actualizaciones!
                </h2>
                <p className="text-white/90 text-sm">
                  Versión {version.version} - {formatDate(version.releaseDate)}
                </p>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-white/90">
            {getPriorityIcon(version.priority)}
            <span className="text-sm font-medium">
              Prioridad: {getPriorityLabel(version.priority)}
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="p-6">
          <div className="space-y-6">
            {/* Descripción principal */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                    {version.title}
                  </h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <p className={`text-sm ${textColors.secondary}`}>
                  {version.description}
                </p>
              </CardBody>
            </Card>

            {/* Lista de cambios */}
            <div className="space-y-3">
              <h4 className={`text-lg font-semibold ${textColors.primary} flex items-center gap-2`}>
                <Zap className="w-5 h-5" />
                Cambios incluidos
              </h4>
              
              <ScrollShadow className="max-h-60 space-y-3">
                {version.changes.map((change, index) => (
                  <Card key={change.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {getChangeIcon(change.icon || 'star')}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className={`font-semibold ${textColors.primary}`}>
                              {change.title}
                            </h5>
                            <Chip
                              size="sm"
                              variant="bordered"
                              className={`${getChangeTypeColor(change.type)} text-xs font-medium`}
                            >
                              {getChangeTypeLabel(change.type)}
                            </Chip>
                          </div>
                          <p className={`text-sm ${textColors.secondary} leading-relaxed`}>
                            {change.description}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </ScrollShadow>
            </div>

            {/* Información adicional */}
            <Card className="border border-gray-200 bg-gray-50">
              <CardBody className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Fecha de lanzamiento: {formatDate(version.releaseDate)}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter className="p-6 bg-gray-50">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-600">
              Gracias por usar TiendaFix 🚀
            </p>
            <Button
              className="bg-gradient-to-r from-[#4ca771] to-[#013237] text-white font-medium px-6"
              onPress={handleClose}
              startContent={<CheckCircle className="w-4 h-4" />}
            >
              ¡Entendido!
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Hook para manejar los anuncios
export function useAnnouncements() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null)

  useEffect(() => {
    const checkForAnnouncements = () => {
      const lastSeenVersion = localStorage.getItem('lastSeenVersion')
      const latestVersion = getLatestVersion()
      
      if (latestVersion && shouldShowAnnouncement(lastSeenVersion || undefined)) {
        setCurrentVersion(latestVersion)
        onOpen()
      }
    }

    // Comprobar al cargar y después de un pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(checkForAnnouncements, 1000)
    return () => clearTimeout(timer)
  }, [onOpen])

  const markAsSeen = (version: string) => {
    localStorage.setItem('lastSeenVersion', version)
    setCurrentVersion(null)
  }

  return {
    isOpen,
    onClose,
    currentVersion,
    markAsSeen
  }
} 