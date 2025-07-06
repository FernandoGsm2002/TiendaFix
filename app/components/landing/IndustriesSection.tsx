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
      {/* Ultra Modern Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ultra Modern Header */}
        <div className="text-center mb-24">
          <Badge
            content="HOT"
            color="danger"
            placement="top-right"
            className="mb-8"
          >
            <Chip
              startContent={<Crown className="w-5 h-5 animate-pulse" />}
              endContent={<Sparkles className="w-5 h-5 animate-pulse" />}
              variant="flat"
              color="primary"
              className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-blue-800 px-8 py-4 text-lg font-bold shadow-2xl border border-blue-200/50 hover:scale-105 transition-transform duration-300"
            >
              Especialización Única en el Mercado
            </Chip>
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent block">
              Solo Móviles y Tablets
            </span>
          </h2>
          
          <Card className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl border-0">
            <CardBody className="p-8">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                TiendaFix es el único software especializado 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                  {" "}100% en reparación de dispositivos móviles y tablets,
                </span>
                {" "}con funcionalidades exclusivas que ningún otro taller tiene.
              </p>
              <Spacer y={4} />
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span>100% Especializado</span>
                </div>
                <Divider orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Funciones Exclusivas</span>
                </div>
                <Divider orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-500" />
                  <span>Líder del Mercado</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Ultra Modern Device Specialization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
          {specialties.map((specialty, index) => (
            <Card 
              key={specialty.id}
              className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${specialty.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <CardHeader className="relative z-10 pb-6 pt-8">
                <div className="flex items-center gap-6 mb-6">
                  <Avatar
                    icon={specialty.icon}
                    className={`bg-gradient-to-r ${specialty.gradient} text-white group-hover:scale-125 transition-all duration-500`}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
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
                    color={index === 0 ? "primary" : "success"}
                    className="h-2"
                    classNames={{
                      indicator: `bg-gradient-to-r ${specialty.gradient}`
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

        {/* Ultra Modern Unique Features */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <Badge
              content="NEW"
              color="danger"
              placement="top-right"
              className="mb-8"
            >
              <Chip
                startContent={<Award className="w-5 h-5 animate-bounce" />}
                endContent={<Sparkles className="w-5 h-5 animate-pulse" />}
                variant="flat"
                color="secondary"
                className="bg-gradient-to-r from-purple-100 via-orange-100 to-pink-100 text-purple-800 px-8 py-4 text-lg font-bold shadow-2xl border border-purple-200/50 hover:scale-105 transition-transform duration-300"
              >
                Funcionalidades que Solo TiendaFix Tiene
              </Chip>
            </Badge>
            
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Ventajas Competitivas Únicas
              </span>
            </h3>
            
            <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl shadow-xl border-0">
              <CardBody className="p-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Estas funcionalidades nos diferencian de cualquier otro software del mercado
                </p>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {uniqueFeatures.map((feature, index) => (
              <div key={feature.id} className="relative">
                {/* Badge Outside the Card */}
                <div className="flex justify-center mb-6">
                  <Badge
                    content=""
                    color={index === 0 ? "danger" : "warning"}
                    placement="top-right"
                  >
                    <Chip
                      startContent={index === 0 ? <Crown className="w-5 h-5 animate-pulse" /> : <Target className="w-5 h-5 animate-bounce" />}
                      variant="solid"
                      color={index === 0 ? "danger" : "warning"}
                      className="px-6 py-3 text-sm font-black shadow-2xl hover:scale-110 transition-transform duration-300"
                    >
                      {feature.badge}
                    </Chip>
                  </Badge>
                </div>

                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden relative h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <CardHeader className="relative z-10 pb-6 pt-8">
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar
                        icon={feature.icon}
                        className={`bg-gradient-to-r ${feature.gradient} text-white group-hover:scale-125 transition-all duration-500`}
                        size="lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
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
                        color={index === 0 ? "secondary" : "warning"}
                        className="h-2"
                        classNames={{
                          indicator: `bg-gradient-to-r ${feature.gradient}`
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

        {/* Ultra Modern Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-16 text-white relative overflow-hidden mb-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(255,255,255,0.1),transparent)]"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <Lightbulb className="w-4 h-4 animate-pulse" />
              <span>La Diferencia TiendaFix</span>
            </div>
            
            <h3 className="text-4xl md:text-5xl font-black mb-12 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
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
                  <div className="text-blue-100 font-medium">Especializado en móviles</div>
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
                  <div className="text-blue-100 font-medium">Funcionalidades únicas</div>
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
                  <div className="text-blue-100 font-medium">Meses en el mercado</div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Ultra Modern CTA Section */}
        <div className="text-center">
          <Card className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
            
            <CardBody className="p-16 relative z-10">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
                <Rocket className="w-4 h-4 animate-bounce" />
                <span>Únete a la Revolución</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ¿Listo para la diferencia TiendaFix?
                </span>
              </h3>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Únete a los <span className="font-bold text-blue-600">100+ talleres</span> que ya disfrutan de funcionalidades exclusivas 
                para móviles y tablets que ningún otro software ofrece.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Tooltip 
                  content="Comienza tu prueba gratuita de 7 días"
                  placement="top"
                  color="primary"
                  className="text-white"
                >
                  <Button 
                    as={Link}
                    href="/auth/register"
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold px-12 py-6 text-xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 relative overflow-hidden group border-0"
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
                    className="border-2 border-gray-300 text-gray-700 font-bold px-12 py-6 text-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 group"
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