"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Tabs,
  Tab,
  Avatar,
  Link,
  Spacer,
  Divider,
  Image,
  Badge,
  Progress,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import {
  BookOpen,
  Play,
  Users,
  Smartphone,
  Package,
  Wrench,
  CreditCard,
  BarChart3,
  ArrowLeft,
  ExternalLink,
  Star,
  Clock,
  Video,
  Download,
  Zap,
  Sparkles,
  Shield,
  Award,
  Lightbulb,
  Rocket,
  PlayCircle,
  Eye,
  Filter,
  Search,
  TrendingUp,
  CheckCircle,
  Globe,
  Maximize,
  Volume2,
  RotateCcw,
  Settings,
  Heart,
  Share2,
  Bookmark
} from "lucide-react";

const videoTutorials = [
  {
    id: "dashboard",
    title: "Panel de Control",
    description: "Aprende a navegar y utilizar el panel principal de TiendaFix para gestionar tu taller de manera eficiente.",
    videoSrc: "/mp4/dashboardpos.mp4",
    duration: "5:30",
    icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
    category: "Básico",
    topics: [
      "Navegación por el dashboard",
      "Widgets y estadísticas principales",
      "Configuración inicial",
      "Accesos rápidos"
    ]
  },
  {
    id: "clientes",
    title: "Gestión de Clientes",
    description: "Domina el módulo de clientes para mantener un registro completo de tus customers y mejorar el servicio.",
    videoSrc: "/mp4/clientes.mp4",
    duration: "4:15",
    icon: <Users className="w-6 h-6 text-green-600" />,
    category: "Gestión",
    topics: [
      "Registro de nuevos clientes",
      "Edición de información",
      "Historial de servicios",
      "Búsqueda y filtros"
    ]
  },
  {
    id: "reparaciones",
    title: "Seguimiento de Reparaciones",
    description: "Aprende a gestionar el ciclo completo de reparaciones desde el ingreso hasta la entrega al cliente.",
    videoSrc: "/mp4/reparaciones.mp4",
    duration: "6:45",
    icon: <Wrench className="w-6 h-6 text-purple-600" />,
    category: "Operaciones",
    topics: [
      "Ingreso de equipos",
      "Asignación de técnicos",
      "Estados de reparación",
      "Entrega y facturación"
    ]
  },
  {
    id: "inventario",
    title: "Control de Inventario",
    description: "Mantén un control preciso de tu stock de repuestos y componentes para optimizar tus operaciones.",
    videoSrc: "/mp4/inventario.mp4",
    duration: "4:55",
    icon: <Package className="w-6 h-6 text-orange-600" />,
    category: "Gestión",
    topics: [
      "Registro de productos",
      "Control de stock",
      "Alertas de inventario bajo",
      "Reportes de movimientos"
    ]
  },
  {
    id: "personal",
    title: "Administración de Personal",
    description: "Gestiona tu equipo de técnicos, asigna tareas y monitorea el rendimiento del personal.",
    videoSrc: "/mp4/personal.mp4",
    duration: "5:20",
    icon: <Users className="w-6 h-6 text-indigo-600" />,
    category: "Recursos Humanos",
    topics: [
      "Registro de técnicos",
      "Asignación de permisos",
      "Seguimiento de rendimiento",
      "Cálculo de comisiones"
    ]
  },
  {
    id: "desbloqueos",
    title: "Gestión de Desbloqueos",
    description: "Administra servicios de desbloqueo de dispositivos móviles con control de comisiones y seguimiento.",
    videoSrc: "/mp4/desbloqueos.mp4",
    duration: "3:40",
    icon: <Smartphone className="w-6 h-6 text-red-600" />,
    category: "Servicios",
    topics: [
      "Tipos de desbloqueo",
      "Precios y tarifas",
      "Control de comisiones",
      "Seguimiento de solicitudes"
    ]
  }
];

const categories = [
  { key: "all", label: "Todos los Videos", color: "default" as const },
  { key: "Básico", label: "Conceptos Básicos", color: "primary" as const },
  { key: "Gestión", label: "Gestión", color: "success" as const },
  { key: "Operaciones", label: "Operaciones", color: "warning" as const },
  { key: "Recursos Humanos", label: "Personal", color: "secondary" as const },
  { key: "Servicios", label: "Servicios", color: "danger" as const }
];

export default function DocsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isPlaying, setIsPlaying] = React.useState<string | null>(null);
  const [watchedVideos, setWatchedVideos] = React.useState<string[]>([]);
  const [favoriteVideos, setFavoriteVideos] = React.useState<string[]>([]);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedVideo, setSelectedVideo] = React.useState<typeof videoTutorials[0] | null>(null);

  const filteredVideos = React.useMemo(() => {
    let filtered = selectedCategory === "all" 
      ? videoTutorials 
      : videoTutorials.filter(video => video.category === selectedCategory);
    
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [selectedCategory, searchTerm]);

  const handleVideoClick = (video: typeof videoTutorials[0]) => {
    setSelectedVideo(video);
    onOpen();
  };

  const toggleFavorite = (videoId: string) => {
    setFavoriteVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const markAsWatched = (videoId: string) => {
    if (!watchedVideos.includes(videoId)) {
      setWatchedVideos(prev => [...prev, videoId]);
    }
  };

  const completionPercentage = Math.round((watchedVideos.length / videoTutorials.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                as={Link}
                href="/"
                variant="light"
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Volver al Inicio
              </Button>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Documentación</h1>
                  <p className="text-sm text-gray-600">Guías y tutoriales completos</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                content={watchedVideos.length}
                color="success"
                className="hidden sm:flex"
              >
                <Chip
                  startContent={<Video className="w-4 h-4" />}
                  variant="flat"
                  color="success"
                  className="shadow-lg"
                >
                  6 Videos Tutoriales
                </Chip>
              </Badge>
              <Tooltip content="Progreso de aprendizaje">
                <div className="hidden md:flex items-center gap-2">
                  <Progress
                    size="sm"
                    radius="full"
                    value={completionPercentage}
                    color="success"
                    className="w-20"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    {completionPercentage}%
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg border border-blue-200/50">
            <Rocket className="w-5 h-5 animate-bounce" />
            <span>Tutoriales en Video</span>
            <Badge content="NEW" color="danger" size="sm" className="ml-1">
              <div className="w-4 h-4"></div>
            </Badge>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Guías Completas de TiendaFix
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Aprende paso a paso cómo utilizar todas las funcionalidades de TiendaFix para optimizar tu taller
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">6</div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">28m</div>
              <div className="text-sm text-gray-600">Duración</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">HD</div>
              <div className="text-sm text-gray-600">Calidad</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">5★</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-16">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardBody className="p-8">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar tutoriales..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Filtrar por:</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <Chip
                    key={category.key}
                    variant={selectedCategory === category.key ? "solid" : "flat"}
                    color={selectedCategory === category.key ? category.color : "default"}
                    className="cursor-pointer hover:scale-105 transition-transform shadow-sm"
                    onClick={() => setSelectedCategory(category.key)}
                  >
                    {category.label}
                  </Chip>
                ))}
              </div>
              {searchTerm && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Mostrando {filteredVideos.length} resultados para "{searchTerm}"</span>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Introduction Card */}
        <Card className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardBody className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">
                  Bienvenido a TiendaFix
                </h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Estos tutoriales te guiarán paso a paso para dominar todas las funcionalidades de TiendaFix. 
                  Desde la configuración inicial hasta técnicas avanzadas de gestión. ¡Comienza tu viaje hacia 
                  una gestión más eficiente de tu taller!
                </p>
              </div>
              <div className="hidden lg:block ml-8">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Video Tutorials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredVideos.map((video, index) => (
            <Card 
              key={video.id} 
              className="hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-blue-200 group bg-white/80 backdrop-blur-xl"
              isPressable
              onPress={() => handleVideoClick(video)}
            >
              <CardHeader className="pb-4 relative">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  {watchedVideos.includes(video.id) && (
                    <Chip
                      size="sm"
                      color="success"
                      variant="solid"
                      startContent={<CheckCircle className="w-3 h-3" />}
                    >
                      Visto
                    </Chip>
                  )}
                  <Button
                    isIconOnly
                    variant="flat"
                    color={favoriteVideos.includes(video.id) ? "danger" : "default"}
                    className="w-8 h-8 min-w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(video.id);
                    }}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favoriteVideos.includes(video.id) ? 'fill-current' : ''}`} 
                    />
                  </Button>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {video.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip
                        size="sm"
                        variant="flat"
                        color="primary"
                        className="text-xs"
                      >
                        {video.category}
                      </Chip>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{video.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                {/* Video Thumbnail */}
                <div className="relative mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-700 group cursor-pointer">
                  <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                    <img
                      src={`/pngs/banner${(index % 3) + 1}.png`}
                      alt={video.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      HD
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
                  {video.description}
                </p>

                {/* Topics */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    En este tutorial aprenderás:
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {video.topics.slice(0, 4).map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="truncate">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    color="primary"
                    variant="flat"
                    className="flex-1 shadow-lg group-hover:shadow-xl transition-shadow"
                    startContent={<Play className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick(video);
                      markAsWatched(video.id);
                    }}
                  >
                    Ver Tutorial
                  </Button>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        variant="flat"
                        color="default"
                        className="shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="share"
                        startContent={<Share2 className="w-4 h-4" />}
                      >
                        Compartir
                      </DropdownItem>
                      <DropdownItem
                        key="bookmark"
                        startContent={<Bookmark className="w-4 h-4" />}
                      >
                        Guardar
                      </DropdownItem>
                      <DropdownItem
                        key="watch-later"
                        startContent={<Clock className="w-4 h-4" />}
                      >
                        Ver más tarde
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1200/400')] bg-cover bg-center opacity-10"></div>
            <CardBody className="p-12 relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold">
                  ¿Necesitas ayuda adicional?
                </h3>
              </div>
              <p className="text-blue-100 mb-8 text-xl max-w-2xl mx-auto leading-relaxed">
                Si tienes preguntas específicas o necesitas soporte personalizado, estamos aquí para ayudarte
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  as={Link}
                  href="/help"
                  variant="flat"
                  color="default"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold"
                  startContent={<BookOpen className="w-5 h-5" />}
                  endContent={<ExternalLink className="w-4 h-4" />}
                >
                  Centro de Ayuda
                </Button>
                <Button
                  as={Link}
                  href="/auth/register"
                  variant="bordered"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600 shadow-lg font-semibold"
                  startContent={<Zap className="w-5 h-5" />}
                >
                  Comenzar Ahora
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Tutoriales HD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Acceso Ilimitado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Actualizaciones Constantes</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Video Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          size="5xl"
          scrollBehavior="inside"
          backdrop="blur"
          classNames={{
            backdrop: "bg-gradient-to-t from-gray-900/90 to-black/90",
            base: "border-0 bg-white/95 backdrop-blur-xl",
            header: "border-b-[1px] border-gray-200",
            body: "py-0",
            footer: "border-t-[1px] border-gray-200",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedVideo?.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedVideo?.category} • {selectedVideo?.duration}
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-6">
                    {/* Video Player */}
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        controls
                        className="w-full aspect-video"
                        poster={`/pngs/banner${(videoTutorials.findIndex(v => v.id === selectedVideo?.id) % 3) + 1}.png`}
                        onPlay={() => markAsWatched(selectedVideo?.id || '')}
                      >
                        <source src={selectedVideo?.videoSrc} type="video/mp4" />
                        Tu navegador no soporta la reproducción de videos HTML5.
                      </video>
                    </div>
                    
                    {/* Video Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Descripción
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {selectedVideo?.description}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Aprenderás
                        </h4>
                        <ul className="space-y-2">
                          {selectedVideo?.topics.map((topic, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        variant="flat"
                        color={favoriteVideos.includes(selectedVideo?.id || '') ? "danger" : "default"}
                        onClick={() => toggleFavorite(selectedVideo?.id || '')}
                      >
                        <Heart 
                          className={`w-4 h-4 ${favoriteVideos.includes(selectedVideo?.id || '') ? 'fill-current' : ''}`} 
                        />
                      </Button>
                      <Button
                        isIconOnly
                        variant="flat"
                        color="default"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1"></div>
                    <Button 
                      color="danger" 
                      variant="light" 
                      onPress={onClose}
                    >
                      Cerrar
                    </Button>
                    <Button 
                      color="primary" 
                      startContent={<Eye className="w-4 h-4" />}
                      className="bg-gradient-to-r from-blue-500 to-purple-500"
                      onClick={() => markAsWatched(selectedVideo?.id || '')}
                    >
                      Marcar como Visto
                    </Button>
                  </div>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
} 