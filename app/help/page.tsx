"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Accordion,
  AccordionItem,
  Avatar,
  Link,
  Spacer,
  Divider,
  Badge,
  Progress,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Select,
  SelectItem,
  Image,
  Snippet
} from "@heroui/react";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle,
  Users,
  Printer,
  Eye,
  Clock,
  ArrowLeft,
  ExternalLink,
  Star,
  Zap,
  Sparkles,
  Shield,
  Award,
  Lightbulb,
  Headphones,
  Send,
  Copy,
  Heart,
  Rocket,
  Globe,
  BookOpen,
  Video,
  MessageCircle
} from "lucide-react";

const faqs = [
  {
    key: "supervision",
    question: "¿Puedo supervisar a mis técnicos en tiempo real?",
    answer: "Sí, TiendaFix incluye un sistema completo de supervisión que te permite:\n\n• Ver el estado actual de cada técnico (disponible, ocupado, en reparación)\n• Monitorear las reparaciones asignadas en tiempo real\n• Revisar el historial de trabajos completados\n• Establecer metas y objetivos por técnico\n• Recibir notificaciones de cambios de estado\n• Generar reportes de rendimiento individual y grupal\n\nEsto te permite mantener un control total sobre tu equipo y optimizar la productividad del taller.",
    icon: <Users className="w-6 h-6 text-blue-600" />
  },
  {
    key: "contact",
    question: "¿Si tengo una duda me puedo contactar con ustedes?",
    answer: "¡Por supuesto! Ofrecemos múltiples canales de soporte:\n\n• **WhatsApp:** Soporte directo de 9:00 AM a 8:00 PM\n• **Email:** Respuesta en menos de 24 horas\n• **Centro de Ayuda:** Documentación completa disponible 24/7\n• **Videos Tutoriales:** Guías paso a paso para cada función\n• **Soporte Remoto:** Asistencia técnica directa en tu computadora\n\nNuestro equipo está comprometido a ayudarte a aprovechar al máximo TiendaFix. No dudes en contactarnos ante cualquier pregunta o problema.",
    icon: <MessageSquare className="w-6 h-6 text-green-600" />
  },
  {
    key: "printing",
    question: "¿Puedo imprimir tickets de reparación?",
    answer: "Sí, TiendaFix incluye un sistema completo de impresión:\n\n• **Tickets de Reparación:** Comprobantes profesionales para cada servicio\n• **Recibos de Pago:** Documentos oficiales para cobros\n• **Facturas:** Comprobantes fiscales cuando sea necesario\n• **Etiquetas:** Para identificar equipos en reparación\n• **Reportes:** Impresión de estadísticas e informes\n\n**Compatibilidad:**\n• Impresoras térmicas (58mm y 80mm)\n• Impresoras de inyección de tinta\n• Impresoras láser\n• Configuración automática de drivers\n\nTodos los documentos incluyen información del taller y datos del cliente de forma automática.",
    icon: <Printer className="w-6 h-6 text-purple-600" />
  },
  {
    key: "sales-tracking",
    question: "¿Las ventas se ven por el usuario que la hizo?",
    answer: "Absolutamente sí. TiendaFix registra detalladamente:\n\n• **Ventas por Usuario:** Cada venta se asocia automáticamente al usuario que la realizó\n• **Comisiones:** Cálculo automático de comisiones por vendedor\n• **Reportes Individuales:** Estadísticas de ventas por técnico/vendedor",
    icon: <Eye className="w-6 h-6 text-orange-600" />
  }
];

const contactMethods = [
  {
    icon: <MessageSquare className="w-8 h-8 text-green-500" />,
    title: "WhatsApp",
    description: "Soporte directo 9AM - 8PM",
    action: "Contactar por WhatsApp",
    href: "https://wa.me/message/51998936755", // Reemplazar con el número real
    color: "success" as const
  },
  {
    icon: <Mail className="w-8 h-8 text-blue-500" />,
    title: "Email",
    description: "Respuesta en 24 horas",
    action: "Enviar Email",
    href: "mailto:support@tiendafix.com",
    color: "primary" as const
  },
  {
    icon: <Phone className="w-8 h-8 text-purple-500" />,
    title: "Teléfono",
    description: "Atención personalizada",
    action: "Llamar Ahora",
    href: "tel:+51998936755", // Reemplazar con el número real
    color: "secondary" as const
  }
];

export default function HelpPage() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedContact, setSelectedContact] = React.useState<typeof contactMethods[0] | null>(null);

  const handleContactClick = (method: typeof contactMethods[0]) => {
    setSelectedContact(method);
    onOpen();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
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
                  <HelpCircle className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Centro de Ayuda</h1>
                  <p className="text-sm text-gray-600">Encuentra respuestas a tus preguntas</p>
                </div>
              </div>
            </div>
            <Badge
              content=""
              color="success"
              shape="circle"
              placement="top-right"
              className="hidden sm:flex"
            >
              <Chip
                startContent={<Sparkles className="w-4 h-4" />}
                variant="flat"
                color="warning"
                className="shadow-lg"
              >
                Soporte Premium
              </Chip>
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg border border-blue-200/50">
            <Rocket className="w-5 h-5 animate-bounce" />
            <span>Respuestas Rápidas</span>
            <Chip size="sm" color="danger" variant="solid" className="ml-1 text-white">4</Chip>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Encuentra respuestas rápidas a las preguntas más comunes sobre TiendaFix
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Progress
              size="sm"
              radius="full"
              classNames={{
                base: "max-w-md",
                track: "drop-shadow-md border border-default",
                indicator: "bg-gradient-to-r from-blue-500 to-purple-500",
                label: "tracking-wider font-medium text-default-600",
                value: "text-foreground/60",
              }}
              label="Satisfacción del Cliente"
              value={98}
              showValueLabel={true}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
            <CardBody className="p-0">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Preguntas Más Frecuentes</h3>
                </div>
                <p className="text-gray-600">Respuestas detalladas a las consultas más comunes</p>
              </div>
              <div className="p-8">
                <Accordion
                  variant="splitted"
                  selectionMode="multiple"
                  className="px-0"
                  itemClasses={{
                    base: "mb-4",
                    title: "font-medium text-gray-900",
                    trigger: "px-6 py-4 hover:bg-blue-50 transition-colors rounded-lg border border-gray-200/50 shadow-sm",
                    content: "text-gray-700 px-6 pb-4",
                  }}
                >
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={faq.key}
                      aria-label={faq.question}
                      title={
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex-shrink-0">
                            {faq.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                              {faq.question}
                            </h4>
                          </div>
                          <Badge
                            content={index + 1}
                            color="primary"
                            size="sm"
                            className="flex-shrink-0"
                          >
                            <div className="w-6 h-6"></div>
                          </Badge>
                        </div>
                      }
                      className="group"
                    >
                      <div className="pl-10 pr-4">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                          {faq.answer}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>¿Te fue útil esta respuesta?</span>
                          <Button size="sm" variant="light" color="success" className="ml-2">
                            Sí
                          </Button>
                          <Button size="sm" variant="light" color="danger">
                            No
                          </Button>
                        </div>
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Headphones className="w-4 h-4" />
              <span>Soporte 24/7</span>
            </div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
              ¿Necesitas más ayuda?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Nuestro equipo está disponible para ayudarte con cualquier consulta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card 
                key={index} 
                className="hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-200 group"
                isPressable
                onPress={() => handleContactClick(method)}
              >
                <CardBody className="text-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <div className="w-8 h-8 text-white">
                          {method.icon}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {method.title}
                    </h4>
                    <p className="text-gray-600 mb-6 text-sm">
                      {method.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Disponible ahora</span>
                    </div>
                    <Button
                      color={method.color}
                      variant="flat"
                      className="w-full shadow-lg group-hover:shadow-xl transition-shadow"
                      endContent={<ExternalLink className="w-4 h-4" />}
                    >
                      {method.action}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl border-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1200/400')] bg-cover bg-center opacity-10"></div>
            <CardBody className="p-12 relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold">
                  ¿Todo listo?
                </h3>
              </div>
              <p className="text-blue-100 mb-8 text-xl max-w-2xl mx-auto leading-relaxed">
                Explora nuestras guías detalladas y tutoriales en video para dominar TiendaFix
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  as={Link}
                  href="/docs"
                  variant="flat"
                  color="default"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold"
                  startContent={<Video className="w-5 h-5" />}
                  endContent={<ExternalLink className="w-4 h-4" />}
                >
                  Ver Documentación
                </Button>
                <Button
                  as={Link}
                  href="/auth/register"
                  variant="bordered"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600 shadow-lg font-semibold"
                  startContent={<Zap className="w-5 h-5" />}
                >
                  Comenzar Gratis
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-8 text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Soporte 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Satisfacción Garantizada</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Contact Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          size="2xl"
          scrollBehavior="inside"
          backdrop="blur"
          classNames={{
            backdrop: "bg-gradient-to-t from-blue-900/50 to-purple-900/50",
            base: "border-0 bg-white/95 backdrop-blur-xl",
            header: "border-b-[1px] border-gray-200",
            body: "py-6",
            footer: "border-t-[1px] border-gray-200",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Contactar por {selectedContact?.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedContact?.description}
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        {selectedContact?.icon}
                      </div>
                      <p className="text-gray-600 mb-4">
                        ¿Prefieres contactarnos directamente? Usa el enlace a continuación:
                      </p>
                      <Snippet
                        symbol={<Copy className="w-4 h-4" />}
                        variant="flat"
                        color="primary"
                        className="mb-4"
                      >
                        {selectedContact?.href}
                      </Snippet>
                    </div>
                    
                    <Divider />
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">
                        O déjanos tus datos y te contactaremos:
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Nombre"
                            placeholder="Tu nombre completo"
                            variant="bordered"
                            classNames={{
                              label: "text-gray-700",
                              input: "text-gray-900",
                            }}
                          />
                          <Input
                            label="Email"
                            placeholder="tu@email.com"
                            type="email"
                            variant="bordered"
                            classNames={{
                              label: "text-gray-700",
                              input: "text-gray-900",
                            }}
                          />
                        </div>
                        <Input
                          label="Teléfono"
                          placeholder="+51 999 999 999"
                          type="tel"
                          variant="bordered"
                          classNames={{
                            label: "text-gray-700",
                            input: "text-gray-900",
                          }}
                        />
                        <Select
                          label="Tipo de consulta"
                          placeholder="Selecciona una opción"
                          variant="bordered"
                          classNames={{
                            label: "text-gray-700",
                            trigger: "text-gray-900",
                          }}
                        >
                          <SelectItem key="soporte">Soporte técnico</SelectItem>
                          <SelectItem key="ventas">Información de ventas</SelectItem>
                          <SelectItem key="billing">Facturación</SelectItem>
                          <SelectItem key="other">Otra consulta</SelectItem>
                        </Select>
                        <Textarea
                          label="Mensaje"
                          placeholder="Describe tu consulta..."
                          variant="bordered"
                          minRows={3}
                          classNames={{
                            label: "text-gray-700",
                            input: "text-gray-900",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="danger" 
                    variant="light" 
                    onPress={onClose}
                  >
                    Cerrar
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={onClose}
                    startContent={<Send className="w-4 h-4" />}
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    Enviar Mensaje
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
} 