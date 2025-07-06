"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { Shield, Database, Users, Clock, CheckCircle, Lock, Server, HeadphonesIcon } from "lucide-react";

const securityFeatures = [
  {
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    title: "Privacidad",
    description: "Implementamos niveles comprensivos de seguridad que incluyen respaldo de datos, encriptación y una plataforma de servidor a prueba de fallos",
    color: "bg-blue-50 border-blue-200"
  },
  {
    icon: <Server className="w-8 h-8 text-green-600" />,
    title: "Fiabilidad",
    description: "Tiempo de actividad de la aplicación del 99.8% — garantizando alta disponibilidad en todo el internet",
    color: "bg-green-50 border-green-200"
  },
  {
    icon: <Users className="w-8 h-8 text-purple-600" />,
    title: "Acceso y Permisos",
    description: "Incorpora fácilmente a tus empleados y configura sus niveles de acceso apropiados",
    color: "bg-purple-50 border-purple-200"
  }
];

const supportFeatures = [
  {
    icon: <HeadphonesIcon className="w-6 h-6 text-blue-600" />,
    title: "Gerente Dedicado de Soporte por Chat",
    description: "Asistencia personalizada"
  },
  {
    icon: <Clock className="w-6 h-6 text-green-600" />,
    title: "Respuesta Instantánea",
    description: "Tiempo de respuesta < 2 minutos"
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-purple-600" />,
    title: "Soporte las 24 Horas",
    description: "Disponible todos los días"
  },
  {
    icon: <Database className="w-6 h-6 text-orange-600" />,
    title: "Acceso a la Base de Conocimientos",
    description: "Documentación completa"
  }
];

const stats = [
  {
    number: "99.8%",
    label: "Tiempo de actividad",
    description: "Disponibilidad garantizada"
  },
  {
    number: "500+",
    label: "Talleres activos",
    description: "Confían en nosotros"
  },
  {
    number: "< 2min",
    label: "Tiempo de respuesta",
    description: "Soporte técnico"
  },
  {
    number: "24/7",
    label: "Disponibilidad",
    description: "Soporte continuo"
  }
];

export function SecuritySection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Security Features */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>¿Por Qué es Seguro Usar TiendaFix?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seguridad y Confiabilidad de Nivel Empresarial
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tu negocio merece la máxima protección. TiendaFix implementa las mejores prácticas de seguridad 
              para mantener tus datos y los de tus clientes completamente protegidos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className={`${feature.color} border-2 hover:shadow-lg transition-shadow duration-300`}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                </CardHeader>
                <CardBody className="pt-0">
                  <p className="text-gray-700 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HeadphonesIcon className="w-4 h-4" />
              <span>Siempre a Tu Lado</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Obtén Tu Gerente Dedicado, Disponible Durante Toda la Semana
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              No estás solo en este viaje. Nuestro equipo de soporte especializado está aquí para ayudarte 
              en cada paso del camino, desde la configuración inicial hasta el crecimiento de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportFeatures.map((feature, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow duration-300">
                <CardBody className="p-6 text-center">
                  <div className="mb-4 p-3 bg-gray-50 rounded-full w-fit mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 p-6 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">SSL Certificado</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Backup Automático</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 