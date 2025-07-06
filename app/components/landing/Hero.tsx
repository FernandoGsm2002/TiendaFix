"use client";

import React from "react";
import { 
  Button, 
  Link, 
  Chip, 
  Badge, 
  Card, 
  CardBody,
  Avatar,
  Progress,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Skeleton,
  Spacer,
  Divider
} from "@heroui/react";
import { 
  ArrowRight, 
  Play, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  Smartphone, 
  TrendingUp,
  CheckCircle,
  Sparkles,
  Globe,
  Award,
  Rocket,
  Heart,
  Crown,
  Lightbulb,
  Timer,
  Target,
  Gauge,
  MessageCircle,
  Video,
  Download,
  ExternalLink
} from "lucide-react";

export function Hero() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);

  const testimonials = [
    { name: "Carlos Mendez", role: "Dueño de TechFix", message: "TiendaFix cambió mi forma de trabajar completamente" },
    { name: "Ana Rodriguez", role: "Gerente RepairPro", message: "Nunca había visto un software tan fácil de usar" },
    { name: "Miguel Torres", role: "Técnico Principal", message: "La función de inventario me ahorra 2 horas diarias" }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ultra Modern Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#f3f4f6,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_100%,#e5e7eb,transparent)]"></div>
      </div>
      
      {/* Advanced Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-gray-400/30 to-gray-500/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-gray-500/30 to-gray-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-gray-600/30 to-gray-700/30 rounded-full blur-2xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-40 right-10 w-36 h-36 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-full blur-2xl animate-pulse delay-3000"></div>
      
      {/* Geometric Background Patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-gray-600 rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-gray-700 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-gray-800 rounded-full animate-bounce delay-1500"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center">
          {/* Ultra Modern Badge */}
          <Badge
            content="NEW"
            color="danger"
            placement="top-right"
            className="mb-6 md:mb-8"
          >
            <Chip
              startContent={<Crown className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />}
              endContent={<Sparkles className="w-4 h-4 md:w-5 md:h-5" />}
              variant="flat"
              color="default"
              className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-800 px-4 md:px-8 py-2 md:py-4 text-sm md:text-lg font-bold shadow-2xl border border-gray-300/50 hover:scale-105 transition-transform duration-300"
            >
              <span className="hidden sm:inline">Líder en Software para Talleres V2</span>
              <span className="sm:hidden">Software para Talleres V2</span>
            </Chip>
          </Badge>
          
          {/* Enhanced Main Title with Animation */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black tracking-tight mb-4 relative">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent block">
                <span className="hidden sm:inline">Software para Taller</span>
                <span className="sm:hidden">Software Taller</span>
              </span>
              <span className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent block relative">
                de Reparación
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-600/20 to-gray-800/20 blur-lg rounded-lg"></div>
              </span>
            </h1>
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>100% en la Nube</span>
                <Rocket className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
              </div>
            </div>
          </div>
          
          {/* Enhanced Subtitle */}
          <Card className="max-w-5xl mx-auto mb-8 md:mb-12 bg-white/80 backdrop-blur-xl shadow-2xl border-0">
            <CardBody className="p-4 md:p-8">
              <p className="text-base md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
                La solución completa para talleres de reparación de móviles y tablets. 
                <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-semibold">
                  {" "}Gestiona inventario, técnicos, reparaciones y ventas desde la nube.
                </span>
              </p>
              <Spacer y={4} />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs md:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-gray-600" />
                  <span>Setup en 5 minutos</span>
                </div>
                <Divider orientation="vertical" className="h-4 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-700" />
                  <span>Datos seguros</span>
                </div>
                <Divider orientation="vertical" className="h-4 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-800" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Enhanced Social Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardBody className="p-4 md:p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 md:w-6 md:h-6 text-yellow-400 fill-current group-hover:scale-110 transition-transform duration-300" style={{animationDelay: `${i * 100}ms`}} />
                    ))}
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">4.9/5</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Calificación Promedio</div>
                <Progress 
                  value={98} 
                  color="warning" 
                  className="mt-2"
                  classNames={{
                    indicator: "bg-gradient-to-r from-yellow-400 to-orange-500"
                  }}
                />
              </CardBody>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardBody className="p-4 md:p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Avatar
                    icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white group-hover:scale-110 transition-transform duration-300"
                    size="lg"
                  />
                </div>
                <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">100+</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Talleres Activos</div>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+25% este mes</span>
                </div>
              </CardBody>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
              <CardBody className="p-4 md:p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Avatar
                    icon={<Target className="w-5 h-5 md:w-6 md:h-6" />}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300"
                    size="lg"
                  />
                </div>
                <div className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">3 meses</div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">En el mercado</div>
                <Chip size="sm" color="success" variant="flat" className="mt-2">
                  Crecimiento Rápido
                </Chip>
              </CardBody>
            </Card>
          </div>

          {/* Live Testimonial Carousel */}
          <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-xl">
            <CardBody className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <Avatar
                  src={`https://i.pravatar.cc/100?u=${currentTestimonial}`}
                  size="lg"
                  className="ring-4 ring-gray-300"
                />
              </div>
              <blockquote className="text-lg text-gray-700 italic mb-4">
                "{testimonials[currentTestimonial].message}"
              </blockquote>
              <div>
                <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                <div className="text-sm text-gray-600">{testimonials[currentTestimonial].role}</div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-gray-700 w-6' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
          
          {/* Ultra Modern CTA Buttons */}
          <div className="flex flex-col gap-4 md:gap-6 mb-12 md:mb-16 px-4">
            <Tooltip 
              content="Comienza tu prueba gratuita de 7 días"
              placement="top"
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white"
            >
              <Button 
                as={Link} 
                href="/auth/register" 
                size="lg"
                className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white font-bold px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 relative overflow-hidden group border-0 w-full sm:w-auto"
                endContent={<Rocket className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300" />}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="hidden sm:inline">Comenzar Gratis</span>
                  <span className="sm:hidden">Comenzar</span>
                  <Badge content="" size="sm" color="warning" className="ml-2">
                    <span className="text-xs px-2 py-1">7 días</span>
                  </Badge>
                </span>
              </Button>
            </Tooltip>
            
            <div className="flex gap-3">
              <Tooltip 
                content="Mira nuestro demo interactivo"
                placement="top"
                color="primary"
                className="text-white"
              >
                <Button 
                  as={Link}
                  href="/dashboard/demo"
                  size="lg"
                  variant="bordered"
                  className="border-2 border-gray-300 text-gray-700 font-bold px-8 py-8 text-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-500 hover:text-gray-800 transition-all duration-300 group"
                  startContent={<Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
                >
                  Ver Demo
                </Button>
              </Tooltip>
              
              <Tooltip 
                content="Visita nuestro centro de ayuda"
                placement="top"
                color="primary"
                className="text-white"
              >
                <Button 
                  as={Link}
                  href="/help"
                  size="lg"
                  variant="ghost"
                  className="text-gray-700 font-bold px-8 py-8 text-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900 transition-all duration-300 group"
                  startContent={<MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
                >
                  Contactar
                </Button>
              </Tooltip>
            </div>
          </div>
          
          {/* Ultra Modern Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardBody className="p-8 text-center relative z-10">
                <div className="mb-6">
                  <Avatar
                    icon={<Smartphone className="w-8 h-8" />}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white group-hover:scale-125 transition-all duration-500 mx-auto"
                    size="lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">
                  Especializado en Móviles
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Diseñado específicamente para talleres de reparación de smartphones y tablets
                </p>
                <div className="mt-4 flex justify-center">
                  <Chip size="sm" variant="flat" color="primary" className="group-hover:scale-105 transition-transform duration-300">
                    100% Móvil
                  </Chip>
                </div>
              </CardBody>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardBody className="p-8 text-center relative z-10">
                <div className="mb-6">
                  <Avatar
                    icon={<Lightbulb className="w-8 h-8" />}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white group-hover:scale-125 transition-all duration-500 mx-auto"
                    size="lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                  Rápido y Eficiente
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Agiliza tu trabajo diario con herramientas diseñadas para máxima productividad
                </p>
                <div className="mt-4 flex justify-center">
                  <Chip size="sm" variant="flat" color="success" className="group-hover:scale-105 transition-transform duration-300">
                    Tiempo Real
                  </Chip>
                </div>
              </CardBody>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardBody className="p-8 text-center relative z-10">
                <div className="mb-6">
                  <Avatar
                    icon={<Shield className="w-8 h-8" />}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white group-hover:scale-125 transition-all duration-500 mx-auto"
                    size="lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">
                  Seguro y Confiable
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Datos en la nube para gestionarlo desde donde estés ¿Qué esperas para dar el salto?
                </p>
                <div className="mt-4 flex justify-center">
                  <Chip size="sm" variant="flat" color="secondary" className="group-hover:scale-105 transition-transform duration-300">
                    Nube Segura
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-6">Confiado por talleres en toda Sudamérica</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Perú</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Colombia</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Ecuador</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Chile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Floating Action Elements */}
      <div className="absolute bottom-8 right-8 hidden lg:block">
        <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 animate-bounce">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
              <span className="text-sm font-semibold text-gray-700">100+ talleres conectados</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="absolute bottom-8 left-8 hidden lg:block">
        <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0 animate-bounce delay-1000">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Prueba gratis</span>
              <Chip size="sm" color="success" variant="flat">7 días</Chip>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Contact Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
        backdrop="blur"
        className="mx-4"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-large">
                <div className="flex items-center gap-3">
                  <Avatar
                    icon={<MessageCircle className="w-6 h-6" />}
                    className="bg-white/20 text-white"
                  />
                  <div>
                    <h3 className="text-xl font-bold">Contacta con Nuestros Expertos</h3>
                    <p className="text-sm text-blue-100">Te respondemos en menos de 24 horas</p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0 shadow-lg">
                      <CardBody className="p-4 text-center">
                        <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900">Chat en Vivo</h4>
                        <p className="text-sm text-gray-600">Respuesta inmediata</p>
                        <Chip size="sm" color="success" variant="flat" className="mt-2">En línea</Chip>
                      </CardBody>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-lg">
                      <CardBody className="p-4 text-center">
                        <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900">Demo Personal</h4>
                        <p className="text-sm text-gray-600">Sesión 1 a 1</p>
                        <Chip size="sm" color="secondary" variant="flat" className="mt-2">Gratis</Chip>
                      </CardBody>
                    </Card>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      ¿Necesitas ayuda específica? Nuestros expertos están listos para ayudarte
                    </p>
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        color="primary"
                        variant="solid"
                        startContent={<ExternalLink className="w-4 h-4" />}
                        as={Link}
                        href="https://wa.me/1234567890"
                        target="_blank"
                        className="bg-gradient-to-r from-green-500 to-green-600"
                      >
                        WhatsApp
                      </Button>
                      
                      <Button
                        color="secondary"
                        variant="solid"
                        startContent={<Video className="w-4 h-4" />}
                        className="bg-gradient-to-r from-purple-500 to-purple-600"
                      >
                        Agendar Demo
                      </Button>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
} 