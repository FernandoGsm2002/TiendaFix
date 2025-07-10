'use client'

import React from 'react'
import { Container } from '@/app/components/ui/Container'
import { useBreakpoint } from '@/lib/hooks/useBreakpoint'
import { useAdaptiveGrid } from '@/lib/hooks/useAdaptiveGrid'

export default function Hero() {
  const { isMobile, isTablet } = useBreakpoint()
  const { gridClass } = useAdaptiveGrid({ minItemWidth: 280, maxColumns: isMobile ? 1 : isTablet ? 2 : 3 })

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-[85vh] flex items-center pt-16 lg:pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      
      <Container size="full" className="relative w-full py-12 lg:py-20">
        {/* Contenido Principal */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <span className="text-green-600 font-medium text-sm">
              🚀 Nueva versión disponible
            </span>
          </div>

          {/* Título Principal */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gray-900">Gestiona tu </span>
              <span className="text-green-600 relative">
                taller de reparaciones
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-60"></div>
              </span>
              <span className="text-gray-900"> con eficiencia</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Simplifica la gestión de reparaciones, inventario y clientes con nuestra plataforma integral diseñada especialmente para talleres profesionales.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <a 
              href="/auth/register"
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              🚀 Comenzar ahora
            </a>
            <a 
              href="/dashboard/demo"
              className="px-8 py-3 text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-lg"
            >
              📖 Ver demostración
            </a>
          </div>
        </div>

        {/* Estadísticas/Features Cards */}
        <div className={`mt-16 ${gridClass} gap-6`}>
          {[
            {
              number: "10,000+",
              label: "Negocios confían en nosotros",
              icon: "🏢"
            },
            {
              number: "99.9%",
              label: "Tiempo de actividad garantizado",
              icon: "⚡"
            },
            {
              number: "24/7",
              label: "Soporte técnico disponible",
              icon: "🛟"
            },
            {
              number: "50+",
              label: "Países nos eligen",
              icon: "🌍"
            }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-center space-y-2">
                <div className="text-2xl">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Preview */}
        <div id="features" className="mt-16 text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
            Todo lo que necesitas en una sola plataforma
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              "Gestión de Reparaciones",
              "Control de Inventario", 
              "Base de Datos de Clientes",
              "Reportes Detallados"
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-3 text-sm md:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
} 