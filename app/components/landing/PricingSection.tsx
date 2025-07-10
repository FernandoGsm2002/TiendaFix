"use client";

import React from "react";
import { 
  Button, 
  Card, 
  CardBody, 
  CardFooter, 
  CardHeader, 
  Chip, 
  Divider, 
  Link, 
  Badge, 
  Progress,
  Avatar,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch,
  Tabs,
  Tab,
  Spacer
} from "@heroui/react";
import { 
  CheckIcon, 
  Star, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  Smartphone, 
  CreditCard, 
  Globe, 
  Headphones, 
  UserCheck, 
  Sparkles, 
  Crown, 
  Award,
  Rocket,
  TrendingUp,
  Heart,
  Target,
  Lightbulb,
  Gift,
  Calculator,
  DollarSign
} from "lucide-react";

const plans = [
  {
    name: "Plan Básico",
    priceUSDT: "9.99",
    pricePEN: "37",
    pricePeriod: "cada 3 meses",
    monthlyEquivalentUSDT: "3.33 USDT/mes",
    monthlyEquivalentPEN: "12 S/./mes",
    description: "Perfecto para empezar",
    technicianLimit: "2 técnicos",
    features: [
      "Gestión completa de reparaciones móviles",
      "Hasta 2 técnicos + dueño",
      "Sistema POS integrado",
      "Inventario inteligente con alertas",
      "Soporte técnico en español"
    ],
    buttonText: "Comenzar Ahora",
    popular: false,
    color: "default" as const,
    icon: <Clock className="w-6 h-6" />,
    gradient: "from-slate-400 to-slate-600",
    bgGradient: "from-slate-50 to-white",
    badge: null
  },
  {
    name: "Plan Pro",
    priceUSDT: "15.99",
    pricePEN: "59",
    pricePeriod: "cada 6 meses",
    monthlyEquivalentUSDT: "2.67 USDT/mes",
    monthlyEquivalentPEN: "10 S/./mes",
    description: "El favorito de los talleres",
    technicianLimit: "4 técnicos",
    features: [
      "Todo del Plan Básico",
      "Hasta 4 técnicos + dueño",
      "Reportes avanzados y analytics",
      "Dashboard inteligente",
      "Soporte prioritario 24/7",
      "Alertas de stock"
    ],
    buttonText: "Elegir Plan Pro",
    popular: true,
    color: "primary" as const,
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-gray-600 to-gray-700",
    bgGradient: "from-gray-50 to-gray-100",
    badge: "MÁS POPULAR"
  },
  {
    name: "Plan Ultra Pro",
    priceUSDT: "21.99",
    pricePEN: "81",
    pricePeriod: "cada 12 meses",
    monthlyEquivalentUSDT: "1.83 USDT/mes",
    monthlyEquivalentPEN: "7 S/./mes",
    description: "Para talleres en expansión",
    technicianLimit: "Ilimitados",
    features: [
      "Todo del Plan Pro",
      "Técnicos ilimitados (5+)",
      "API personalizada",
      "Analisis de inventario",
      "Acceso a capacitacion de tecnicos",
      "Backup de datos"
    ],
    buttonText: "Elegir Ultra Pro",
    popular: false,
    color: "secondary" as const,
    icon: <Crown className="w-6 h-6" />,
    gradient: "from-gray-600 to-gray-800",
    bgGradient: "from-gray-50 to-gray-100",
    badge: "MEJOR VALOR"
  },
];

const features = [
  {
    icon: <Smartphone className="w-6 h-6 text-gray-600" />,
    title: "Especializado en móviles",
    description: "100% enfocado en reparación móvil"
  },
  {
    icon: <Users className="w-6 h-6 text-gray-600" />,
    title: "100+ talleres activos",
    description: "Confianza comprobada"
  },
  {
    icon: <Award className="w-6 h-6 text-gray-600" />,
    title: "+2 meses en el mercado",
    description: "Innovación constante"
  }
];

export function PricingSection() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [isYearly, setIsYearly] = React.useState(false);

  return (
    <section id="precios" className="relative py-28 overflow-hidden">
      {/* Ultra Modern Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/40 via-gray-100/30 to-gray-200/40"></div>
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-gray-400/15 to-gray-500/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-r from-gray-500/15 to-gray-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-gradient-to-r from-gray-600/10 to-gray-700/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ultra Modern Header */}
        <div className="text-center mb-24">
          <Badge
            content=""
            color="danger"
            placement="top-right"
            className="mb-8"
          >
            <Chip
              startContent={<Gift className="w-5 h-5 animate-bounce" />}
              endContent={<Sparkles className="w-5 h-5 animate-pulse" />}
              variant="flat"
              color="default"
              className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-800 px-8 py-4 text-lg font-bold shadow-2xl border border-gray-300/50 hover:scale-105 transition-transform duration-300"
            >
              Planes diseñados para talleres de móviles
            </Chip>
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-8 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent block">
              Elige tu plan
            </span>
            <span className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent block relative">
              perfecto
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-600/20 to-gray-800/20 blur-lg rounded-lg"></div>
            </span>
          </h2>
          
          <Card className="max-w-4xl mx-auto mb-12 bg-white/80 backdrop-blur-xl shadow-2xl border-0">
            <CardBody className="p-8">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6">
                Planes flexibles que crecen contigo. 
                <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-semibold">
                  {" "}Paga en USDT o Soles, cancela cuando quieras, soporte en español incluido.
                </span>
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <span>Sin compromisos</span>
                </div>
                <Divider orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-gray-700" />
                  <span>Soporte 24/7</span>
                </div>
                <Divider orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-gray-800" />
                  <span>Setup instantáneo</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${!isYearly ? 'text-gray-800' : 'text-gray-600'}`}>
                    Trimestral
                  </span>
                  <Switch
                    isSelected={isYearly}
                    onValueChange={setIsYearly}
                    color="default"
                    thumbIcon={<DollarSign className="w-4 h-4" />}
                    classNames={{
                      wrapper: "bg-gradient-to-r from-gray-600 to-gray-700"
                    }}
                  />
                  <span className={`text-sm font-semibold ${isYearly ? 'text-gray-800' : 'text-gray-600'}`}>
                    Anual
                  </span>
                  <Badge content="-30%" color="success" size="sm" className="ml-2">
                    <Chip size="sm" variant="flat" color="success">
                      Ahorra más
                    </Chip>
                  </Badge>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Ultra Modern Features highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => (
            <Card key={index} className="bg-white/90 backdrop-blur-xl shadow-xl border-0 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardBody className="p-8 text-center relative z-10">
                <div className="mb-6">
                  <Avatar
                    icon={feature.icon}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white group-hover:scale-125 transition-all duration-500 mx-auto"
                    size="lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <Progress 
                  value={90 + (index * 3)} 
                  color="primary" 
                  className="max-w-md mx-auto"
                  size="sm"
                  classNames={{
                    indicator: "bg-gradient-to-r from-gray-600 to-gray-700"
                  }}
                />
                <div className="mt-2 text-sm text-gray-500">
                  {90 + (index * 3)}% de satisfacción
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={plan.name} className="relative flex flex-col">
              {/* Badge above card */}
              <div className="h-12 flex items-center justify-center mb-4">
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    <Star className="w-4 h-4 inline mr-2" />
                    {plan.badge}
                  </div>
                )}

                {plan.badge && !plan.popular && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {plan.badge}
                  </div>
                )}
              </div>

              <Card
                className={`relative overflow-hidden transition-all duration-500 hover:scale-105 h-full flex flex-col ${
                  plan.popular 
                    ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/25" 
                    : "border border-gray-200 shadow-xl hover:shadow-2xl"
                }`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-50`}></div>
              
              <CardHeader className="relative z-10 pb-6 pt-8 flex-shrink-0">
                {/* Plan header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white shadow-lg mb-4`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-3">{plan.description}</p>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                    {plan.technicianLimit}
                  </div>
                </div>
                
                {/* Pricing */}
                <div className="space-y-4">
                  {/* USDT Price */}
                  <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-baseline justify-center gap-2 mb-3">
                      <span className="text-4xl font-bold text-gray-900">{plan.priceUSDT}</span>
                      <span className="text-lg font-semibold text-gray-600">USDT</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">/ {plan.pricePeriod}</p>
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {plan.monthlyEquivalentUSDT}
                    </div>
                  </div>

                  {/* Soles Price */}
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 shadow-sm">
                    <div className="flex items-baseline justify-center gap-2 mb-3">
                      <span className="text-4xl font-bold text-green-800">S/. {plan.pricePEN}</span>
                    </div>
                    <p className="text-sm text-green-600 mb-2">/ {plan.pricePeriod}</p>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {plan.monthlyEquivalentPEN}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <Divider className="relative z-10" />
              
              <CardBody className="relative z-10 py-6 flex-grow">
                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
              
              <CardFooter className="relative z-10 pt-6 pb-8 flex-shrink-0">
                <Button 
                  as={Link} 
                  href="/auth/register" 
                  size="lg"
                  fullWidth
                  className={`font-bold text-lg py-6 shadow-lg transition-all duration-300 ${
                    plan.popular 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl hover:scale-105" 
                      : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl"
                  }`}
                  endContent={<Zap className="w-5 h-5" />}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">
                ¿Necesitas algo personalizado?
              </h3>
              <p className="text-xl text-blue-100 mb-8">
                Contáctanos para planes empresariales con funcionalidades específicas para tu taller
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 font-bold hover:bg-gray-50 shadow-lg"
                >
                  Contactar Ventas
                </Button>
                <Button 
                  as={Link}
                  href="/dashboard/demo"
                  size="lg"
                  variant="bordered"
                  className="border-white text-white hover:bg-white/10"
                >
                  Ver Demo Gratis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 