"use client";

import React from "react";
import { 
  Card, 
  CardBody, 
  Avatar, 
  Chip, 
  Badge, 
  Button, 
  Link, 
  Divider,
  Progress,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Image,
  Skeleton
} from "@heroui/react";
import { 
  Star, 
  Quote, 
  Globe, 
  Award, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Sparkles, 
  MessageCircle,
  Heart,
  Target,
  Crown,
  Rocket,
  ThumbsUp,
  MapPin,
  Calendar,
  Play,
  ExternalLink
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Carlos Mendoza",
    role: "Propietario de TechCell",
    location: "Lima, Perú",
    avatar: "/testimonial-1.jpg",
    rating: 5,
    content: "Llegué a TiendaFix hace 2 meses cuando estaba buscando un software especializado en móviles. Me sorprendió lo completo que es para ser tan nuevo. El control de desbloqueos es único en el mercado.",
    business: "80+ reparaciones/mes",
    specialty: "Especialista en iPhone",
    verified: true
  },
  {
    id: 2,
    name: "Ana Rodríguez", 
    role: "Gerente de MovilCenter",
    location: "Bogotá, Colombia",
    avatar: "/testimonial-2.jpg",
    rating: 5,
    content: "Probé TiendaFix desde sus primeras semanas y me encanta cómo van agregando funcionalidades. La asignación de trabajos a clientes con control de deudas es algo que no había visto en ningún otro software.",
    business: "120+ reparaciones/mes",
    specialty: "Especialista en Samsung",
    verified: true
  },
  {
    id: 3,
    name: "Miguel Torres",
    role: "Técnico Principal en RepairPro", 
    location: "Quito, Ecuador",
    avatar: "/testimonial-3.jpg",
    rating: 5,
    content: "Como técnico, me gusta que TiendaFix esté 100% enfocado en móviles y tablets. No pierdo tiempo con funciones que no necesito. En estos 2 meses he visto mejoras constantes en el sistema.",
    business: "60+ reparaciones/mes",
    specialty: "Especialista en Android",
    verified: true
  }
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50/30"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-sm">
            <Award className="w-4 h-4" />
            <span>Testimonios Reales de Usuarios</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            En solo +2 meses, TiendaFix ya está transformando talleres en toda Sudamérica 
            con funcionalidades únicas que no encontrarás en ningún otro software.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center group">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900 ml-2">5.0</span>
              </div>
              <p className="text-gray-600 font-medium">Satisfacción</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">100+</div>
              <p className="text-gray-600 font-medium">Talleres Activos</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">+2</div>
              <p className="text-gray-600 font-medium">Meses en el Mercado</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">100%</div>
              <p className="text-gray-600 font-medium">Especializado</p>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="relative overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-500 hover:scale-105 hover:shadow-2xl h-full flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/30 opacity-50"></div>
              
              {/* Verified Badge */}
              {testimonial.verified && (
                <div className="absolute -top-3 -right-3 z-20">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    VERIFICADO
                  </div>
                </div>
              )}
              
              <CardBody className="relative z-10 p-6 flex-grow flex flex-col">
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Badge color="success" variant="flat" size="sm">
                    Excelente
                  </Badge>
                </div>

                {/* Quote */}
                <div className="relative mb-6 flex-grow">
                  <Quote className="absolute -top-1 -left-1 w-6 h-6 text-blue-200" />
                  <p className="text-gray-700 leading-relaxed pl-5 text-base">
                    "{testimonial.content}"
                  </p>
                </div>

                <Divider className="mb-4" />

                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 border-2 border-blue-200"
                    fallback={testimonial.name.split(' ').map(n => n[0]).join('')}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-base truncate">{testimonial.name}</h4>
                    <p className="text-gray-600 font-medium text-sm truncate">{testimonial.role}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Globe className="w-3 h-3" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="flex items-center justify-between gap-2">
                  <Chip color="primary" variant="flat" size="sm" className="text-xs">
                    {testimonial.business}
                  </Chip>
                  <Chip color="secondary" variant="flat" size="sm" className="text-xs">
                    {testimonial.specialty}
                  </Chip>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Success Story */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Historia de Éxito</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              +2 Meses Transformando el Mercado
            </h3>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              En solo 2 meses, TiendaFix ha demostrado que la especialización es clave. 
              Mientras otros software intentan hacer de todo, nosotros perfeccionamos lo que realmente importa: 
              móviles y tablets con funcionalidades únicas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">🔓</div>
                <div className="text-sm text-blue-100">Control de Desbloqueos Único</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">👤</div>
                <div className="text-sm text-blue-100">Asignación de Trabajos Exclusiva</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">📱</div>
                <div className="text-sm text-blue-100">100% Especializado en Móviles</div>
              </div>
            </div>

            <Button 
              as={Link}
              href="/auth/register"
              size="lg"
              className="bg-white text-blue-600 font-bold px-8 py-6 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              endContent={<MessageCircle className="w-5 h-5" />}
            >
              Únete a la Revolución
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 