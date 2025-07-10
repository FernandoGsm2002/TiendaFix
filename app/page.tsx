import { Navbar } from "./components/landing/Navbar";
import Hero from "./components/landing/Hero";
import { IndustriesSection } from "./components/landing/IndustriesSection";
import { FeatureSection } from "./components/landing/FeatureSection";
import { TestimonialsSection } from "./components/landing/TestimonialsSection";
import { PricingSection } from "./components/landing/PricingSection";
import { SecuritySection } from "./components/landing/SecuritySection";
import { RolesSection } from "./components/landing/RolesSection";
import { Footer } from "./components/landing/Footer";
import { 
  Zap, 
  Shield, 
  Smartphone, 
  BarChart3, 
  Users, 
  MessageCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Star,
  Headphones,
  Database,
  Wrench,
  Package,
  Receipt,
  Rocket,
  Globe
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
              <Navbar />
      <main>
        <Hero />
        
        <IndustriesSection />
        
        <FeatureSection
          subtitle="Control Total de tu Taller"
          title="Gestiona tu taller desde cualquier dispositivo"
          description="TiendaFix ahora en la nube para darte la flexibilidad que necesitas. Ahora puedes controlar tu taller desde tu celular, tablet o computadora. Todo sincronizado en tiempo real."
          imageUrl="/pngs/banner3.png"
          imageAlt="Control de taller desde dispositivos móviles"
          orientation="right"
          backgroundColor="bg-white"
          features={[
            {
              icon: <Wrench className="w-8 h-8 text-gray-700" />,
              title: "Gestión completa de reparaciones",
              description: "Registra, asigna y da seguimiento a todas las reparaciones de tu taller. Desde la recepción del equipo hasta la entrega al cliente, todo bajo control."
            },
            
            {
              icon: <Receipt className="w-8 h-8 text-gray-600" />,
              title: "Impresion de tickets de reparcion y tickets de venta",
              description: "Genera tickets y boletas, para que tus clientes puedan llevar su equipo."
            },
            {
              icon: <Database className="w-8 h-8 text-gray-800" />,
              title: "Historial completo de clientes",
              description: "Mantén un registro detallado de todos los equipos y reparaciones de cada cliente. Ideal para garantías y reparaciones recurrentes."
            }
          ]}
          ctaText="Registrate ahora"
          ctaLink="/auth/register"
        />

        <FeatureSection
          subtitle="Inventario Inteligente"
          title="Nunca te quedes sin repuestos importantes"
          description="El sistema de inventario de TiendaFix te ayuda a mantener el stock perfecto. Alertas automáticas, control de proveedores y reportes de rotación para optimizar tu inversión."
          imageUrl="/pngs/banner2.png"
          imageAlt="Sistema de inventario inteligente"
          orientation="left"
          backgroundColor="bg-gray-50"
          features={[
            {
              icon: <Package className="w-8 h-8 text-gray-600" />,
              title: "Control de stock en tiempo real",
              description: "Sabe exactamente qué tienes en stock, qué se está agotando y qué necesitas comprar. Todo actualizado automáticamente con cada venta o reparación."
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-gray-700" />,
              title: "Alertas de stock mínimo",
              description: "Recibe notificaciones cuando un producto esté llegando a su stock mínimo. Nunca más pierdas una venta por falta de repuestos."
            },
            {
              icon: <BarChart3 className="w-8 h-8 text-gray-800" />,
              title: "Reportes de rentabilidad",
              description: "Conoce qué productos te dan más ganancia, cuáles rotan más rápido y optimiza tus compras basándote en datos reales."
            }
          ]}
          ctaText="Ver Sistema de Inventario"
          ctaLink="/dashboard/demo"
        />

        <PricingSection />

        {/* Professional Final CTA Section - Hero Style */}
        <section className="py-24 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(255,255,255,0.1),transparent)]"></div>
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Enhanced Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
                  <TrendingUp className="w-4 h-4" />
                  <span>Únete a la Revolución Digital</span>
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="block">¿Listo para</span>
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent block">
                    revolucionar tu taller?
                  </span>
                </h2>
                
                                 <p className="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed">
                   Únete a los <span className="font-bold text-white">100+ talleres sudamericanos</span> que ya confían en TiendaFix para gestionar sus reparaciones de móviles y tablets.
                 </p>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <a 
                  href="/auth/register"
                  className="bg-white text-gray-900 font-bold px-12 py-6 text-xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 relative overflow-hidden group border-0 rounded-lg inline-flex items-center gap-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-50/20 to-gray-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Registrate ahora</span>
                  <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
                
                <a 
                  href="/dashboard/demo"
                  className="border-2 border-white/50 text-white font-bold px-12 py-6 text-xl hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm group rounded-lg inline-flex items-center gap-3"
                >
                  <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  Ver Demo Web
                </a>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Globe className="w-6 h-6 text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-lg font-semibold">Sudamérica</span>
                  </div>
                  <p className="text-sm text-gray-200">Solución para tu taller</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-300 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-lg font-semibold">Desde $9.99</span>
                  </div>
                  <p className="text-sm text-gray-200">USDT / S/. 37</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Headphones className="w-6 h-6 text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-lg font-semibold">Soporte 24/7</span>
                  </div>
                  <p className="text-sm text-gray-200">En español</p>
                </div>
              </div>

              {/* Success Metrics */}
              <div className="mt-12 pt-8 border-t border-white/20">
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">100+</div>
                     <div className="text-sm text-gray-200">Talleres Activos</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">4.9★</div>
                     <div className="text-sm text-gray-200">Calificación</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                     <div className="text-sm text-gray-200">Uptime</div>
                   </div>
                   <div className="text-center">
                     <div className="text-3xl font-bold text-white mb-2">7 días</div>
                     <div className="text-sm text-gray-200">Prueba Gratis</div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
} 