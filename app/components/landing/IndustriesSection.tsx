"use client";

import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Link, 
  Chip, 
  Badge, 
  Divider,
  Avatar,
  Progress,
  Tooltip,
  Spacer
} from "@heroui/react";
import { 
  Smartphone, 
  Tablet,
  Unlock,
  UserCheck,
  DollarSign,
  Wrench,
  Shield,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Crown,
  Target,
  Heart,
  Rocket,
  Lightbulb
} from "lucide-react";

const specialties = [
  {
    id: "smartphones",
    title: "Reparación de Smartphones",
    description: "Control completo de reparaciones móviles con seguimiento en tiempo real",
    icon: <Smartphone className="w-8 h-8 text-white" />,
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
    features: ["Gestión por IMEI", "Control de garantías", "Historial completo", "Notificaciones automáticas"]
  },
  {
    id: "tablets",
    title: "Reparación de Tablets",
    description: "Especializado en tablets Android, iPad y dispositivos híbridos",
    icon: <Tablet className="w-8 h-8 text-white" />,
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100",
    features: ["Diagnóstico avanzado", "Gestion de Repuestos", "Gestion de Clientes", "Gestion de Trabajos"]
  }
];

const uniqueFeatures = [
  {
    id: "unlocking",
    title: "Control de Desbloqueos",
    description: "La única funcionalidad que ningún otro taller tiene integrada",
    icon: <Unlock className="w-8 h-8 text-white" />,
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
    badge: "EXCLUSIVO",
    features: [
      "Control para todo tipo de desbloqueos",
      "Historial de desbloqueos",
      "Precios automáticos",
      "Seguimiento de estado",
      "Asignacion a clientes"
    ]
  },
  {
    id: "work-assignment",
    title: "Asignación de Trabajos",
    description: "Asigna trabajos a clientes y controla exactamente lo que deben",
    icon: <UserCheck className="w-8 h-8 text-white" />,
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-50 to-orange-100",
    badge: "ÚNICO",
    features: [
      "Asignación directa a clientes",
      "Control de deudas pendientes",
      "Alertas de pagos",
      "Historial de trabajos",
      "Reportes financieros"
    ]
  }
];

export function IndustriesSection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Elegant Background Effects - Hero Style */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf9] via-[#eafae7] to-[#c0e6ba]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#eafae7,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_100%,#c0e6ba,transparent)]"></div>
      </div>
      
      {/* Professional Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#4ca771]/30 to-[#013237]/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-[#013237]/30 to-[#4ca771]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-[#4ca771]/30 to-[#013237]/30 rounded-full blur-2xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-40 right-10 w-36 h-36 bg-gradient-to-r from-[#013237]/30 to-[#4ca771]/30 rounded-full blur-2xl animate-pulse delay-3000"></div>
      
      {/* Subtle Geometric Patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#4ca771] rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-[#013237] rounded-full animate-bounce delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-[#4ca771] rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#013237] rounded-full animate-bounce delay-1500"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Professional Header - Hero Style */}
        <div className="text-center mb-24">
          <Badge
            content="NEW"
            color="danger"
            placement="top-right"
            className="mb-4 md:mb-8"
          >
            <Chip
              startContent={<Crown className="w-3 h-3 md:w-5 md:h-5 animate-pulse" />}
              endContent={<Sparkles className="w-3 h-3 md:w-5 md:h-5" />}
              variant="flat"
              className="bg-gradient-to-r from-[#f0fdf9] via-[#eafae7] to-[#c0e6ba] text-[#013237] px-3 md:px-8 py-1 md:py-4 text-xs md:text-lg font-bold shadow-2xl border border-[#c0e6ba]/50 hover:scale-105 transition-transform duration-300"
            >
              <span className="hidden sm:inline">Especialización Única en el Mercado</span>
              <span className="sm:hidden">Único en el Mercado</span>
            </Chip>
          </Badge>
          
          <div className="mb-4 md:mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 md:mb-4 relative">
              <span className="bg-gradient-to-r from-[#013237] via-[#4ca771] to-[#013237] bg-clip-text text-transparent block">
                <span className="hidden sm:inline">Solo Móviles y Tablets</span>
                <span className="sm:hidden">Móviles y Tablets</span>
              </span>
            </h2>
            <div className="flex justify-center mt-2 md:mt-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] text-[#013237] px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                <div className="w-2 h-2 bg-[#4ca771] rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Especialización Total</span>
                <span className="sm:hidden">Especializado</span>
                <Target className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
              </div>
            </div>
          </div>
          
          <Card className="max-w-5xl mx-auto mb-6 md:mb-12 bg-[#f0fdf9]/80 backdrop-blur-xl shadow-2xl border border-[#c0e6ba]/50">
            <CardBody className="p-3 md:p-8">
              <p className="text-sm md:text-xl lg:text-2xl text-[#013237] leading-relaxed">
                <span className="hidden sm:inline">TiendaFix es el único software especializado</span>
                <span className="sm:hidden">Software especializado</span>
                <span className="bg-gradient-to-r from-[#4ca771] to-[#013237] bg-clip-text text-transparent font-semibold">
                  {" "}100% en reparación de dispositivos móviles y tablets,
                </span>
                {" "}con funcionalidades exclusivas que ningún otro taller tiene.
              </p>
              <Spacer y={2} className="md:hidden" />
              <Spacer y={4} className="hidden md:block" />
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs md:text-sm text-[#4ca771]">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#4ca771]" />
                  <span>100% Especializado</span>
                </div>
                <Divider orientation="vertical" className="h-4 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#013237]" />
                  <span>Funciones Exclusivas</span>
                </div>
                <Divider orientation="vertical" className="h-4 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-[#013237]" />
                  <span>Líder del Mercado</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Professional Device Specialization - Hero Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
          {specialties.map((specialty, index) => (
            <Card 
              key={specialty.id}
              className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="relative z-10 pb-6 pt-8">
                <div className="flex items-center gap-6 mb-6">
                  <Avatar
                    icon={specialty.icon}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white group-hover:scale-125 transition-all duration-500"
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                      {specialty.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{specialty.description}</p>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Especialización</span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                  <Progress 
                    value={100} 
                    className="h-2"
                    classNames={{
                      indicator: "bg-gradient-to-r from-gray-600 to-gray-700"
                    }}
                  />
                </div>
              </CardHeader>
              
              <CardBody className="relative z-10 pt-0 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specialty.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm group-hover:bg-white/80 transition-all duration-300">
                      <Avatar
                        icon={<CheckCircle className="w-4 h-4" />}
                        className="bg-green-100 text-green-600 flex-shrink-0"
                        size="sm"
                      />
                      <span className="text-sm text-gray-700 font-medium leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Professional Unique Features - Hero Style */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <Badge
              content="NEW"
              color="danger"
              placement="top-right"
              className="mb-4 md:mb-8"
            >
              <Chip
                startContent={<Award className="w-3 h-3 md:w-5 md:h-5 animate-bounce" />}
                endContent={<Sparkles className="w-3 h-3 md:w-5 md:h-5 animate-pulse" />}
                variant="flat"
                className="bg-gradient-to-r from-[#f0fdf9] via-[#eafae7] to-[#c0e6ba] text-[#013237] px-3 md:px-8 py-1 md:py-4 text-xs md:text-lg font-bold shadow-2xl border border-[#c0e6ba]/50 hover:scale-105 transition-transform duration-300"
              >
                <span className="hidden sm:inline">Funcionalidades que Solo TiendaFix Tiene</span>
                <span className="sm:hidden">Solo TiendaFix</span>
              </Chip>
            </Badge>
            
            <div className="mb-4 md:mb-8">
              <h3 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-4 relative">
                <span className="bg-gradient-to-r from-[#013237] via-[#4ca771] to-[#013237] bg-clip-text text-transparent">
                  Ventajas Competitivas Únicas
                </span>
              </h3>
              <div className="flex justify-center mt-2 md:mt-4">
                <div className="flex items-center gap-2 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] text-[#013237] px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                  <div className="w-2 h-2 bg-[#4ca771] rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Funcionalidades Exclusivas</span>
                  <span className="sm:hidden">Exclusivas</span>
                  <Award className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
                </div>
              </div>
            </div>
            
            <Card className="max-w-4xl mx-auto bg-[#f0fdf9]/80 backdrop-blur-xl shadow-xl border border-[#c0e6ba]/50">
              <CardBody className="p-3 md:p-6">
                <p className="text-sm md:text-lg text-[#013237] leading-relaxed">
                  Estas funcionalidades nos diferencian de cualquier otro software del mercado
                </p>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {uniqueFeatures.map((feature, index) => (
              <div key={feature.id} className="relative">
                {/* Badge Outside the Card - Hero Style */}
                <div className="flex justify-center mb-6">
                  <Badge
                    content=""
                    color="danger"
                    placement="top-right"
                  >
                    <Chip
                      startContent={index === 0 ? <Crown className="w-5 h-5 animate-pulse" /> : <Target className="w-5 h-5 animate-bounce" />}
                      variant="solid"
                      className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 text-sm font-black shadow-2xl hover:scale-110 transition-transform duration-300"
                    >
                      {feature.badge}
                    </Chip>
                  </Badge>
                </div>

                <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative z-10 pb-6 pt-8">
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar
                        icon={feature.icon}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white group-hover:scale-125 transition-all duration-500"
                        size="lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                    
                    {/* Uniqueness Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Exclusividad</span>
                        <span className="text-sm text-gray-500">100%</span>
                      </div>
                      <Progress 
                        value={100} 
                        className="h-2"
                        classNames={{
                          indicator: "bg-gradient-to-r from-gray-600 to-gray-700"
                        }}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardBody className="relative z-10 pt-0 pb-8">
                    <div className="space-y-4">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-4 p-4 rounded-lg bg-white/60 backdrop-blur-sm group-hover:bg-white/80 transition-all duration-300">
                          <Avatar
                            icon={<CheckCircle className="w-4 h-4" />}
                            className="bg-green-100 text-green-600 flex-shrink-0"
                            size="sm"
                          />
                          <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Stats Section - Hero Style */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-3xl p-16 text-white relative overflow-hidden mb-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(255,255,255,0.1),transparent)]"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <Lightbulb className="w-4 h-4 animate-pulse" />
              <span>La Diferencia TiendaFix</span>
            </div>
            
            <h3 className="text-4xl md:text-5xl font-black mb-12 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
                ¿Por qué elegir TiendaFix?
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white/10 backdrop-blur-sm border-0 shadow-xl hover:bg-white/20 transition-all duration-300 group">
                <CardBody className="p-6 text-center">
                  <Avatar
                    icon={<Target className="w-8 h-8" />}
                    className="bg-white/20 text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                    size="lg"
                  />
                  <div className="text-4xl font-black mb-2">100%</div>
                  <div className="text-gray-100 font-medium">Especializado en móviles</div>
                </CardBody>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-0 shadow-xl hover:bg-white/20 transition-all duration-300 group">
                <CardBody className="p-6 text-center">
                  <Avatar
                    icon={<Crown className="w-8 h-8" />}
                    className="bg-white/20 text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                    size="lg"
                  />
                  <div className="text-4xl font-black mb-2">2</div>
                  <div className="text-gray-100 font-medium">Unico pensado en llevar tus unlocks</div>
                </CardBody>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-0 shadow-xl hover:bg-white/20 transition-all duration-300 group">
                <CardBody className="p-6 text-center">
                  <Avatar
                    icon={<TrendingUp className="w-8 h-8" />}
                    className="bg-white/20 text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                    size="lg"
                  />
                  <div className="text-4xl font-black mb-2">3</div>
                  <div className="text-gray-100 font-medium">interfaz moderna y responsiva</div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Professional CTA Section - Hero Style */}
        <div className="text-center">
          <Card className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf9] to-[#eafae7]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-[#4ca771]/10 to-[#013237]/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-[#013237]/10 to-[#4ca771]/10 rounded-full blur-2xl"></div>
            
            <CardBody className="p-16 relative z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] text-[#013237] px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Rocket className="w-4 h-4 animate-bounce" />
                <span>Únete a la Revolución</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-[#013237] via-[#4ca771] to-[#013237] bg-clip-text text-transparent">
                  ¿Listo para la diferencia TiendaFix?
                </span>
              </h3>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Únete a los <span className="font-bold text-[#4ca771]">100+ talleres</span> que ya disfrutan de funcionalidades exclusivas 
                para móviles y tablets que ningún otro software ofrece.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Tooltip 
                  content="Comienza tu prueba gratuita de 7 días"
                  placement="top"
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white"
                >
                  <Button 
                    as={Link}
                    href="/auth/register"
                    size="lg"
                    className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white font-bold px-12 py-6 text-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 relative overflow-hidden group border-0"
                    endContent={<Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300" />}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Comenzar Prueba Gratis</span>
                  </Button>
                </Tooltip>
                
                <Tooltip 
                  content="Explora todas las funcionalidades exclusivas"
                  placement="top"
                  color="primary"
                  className="text-white"
                >
                  <Button 
                    as={Link}
                    href="/dashboard/demo"
                    size="lg"
                    variant="bordered"
                    className="border-2 border-gray-300 text-gray-700 font-bold px-12 py-6 text-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-500 hover:text-gray-800 transition-all duration-300 group"
                    startContent={<Lightbulb className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />}
                  >
                    Ver Demo de Funcionalidades
                  </Button>
                </Tooltip>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>7 días gratis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Sin compromisos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>4.9/5 satisfacción</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
} 