import Link from 'next/link'
import { ArrowRight, Smartphone, Wrench, BarChart3, Users, Shield, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TiendaFix</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Iniciar Sesión
              </Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Registrar Tienda
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestiona tu tienda de
              <span className="text-indigo-600"> reparaciones</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema completo para administrar clientes, reparaciones, inventario, ventas y unlocks. 
              Todo en una plataforma segura y fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
              >
                Empezar Prueba Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/auth/login" 
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg border border-indigo-600 hover:bg-indigo-50"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu negocio
            </h2>
            <p className="text-lg text-gray-600">
              Funciones diseñadas específicamente para tiendas de reparación
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <Wrench className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Reparaciones</h3>
              <p className="text-gray-600">
                Controla el flujo completo de reparaciones desde la recepción hasta la entrega.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Users className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Clientes y Dispositivos</h3>
              <p className="text-gray-600">
                Base de datos completa de clientes y sus dispositivos con historial detallado.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <BarChart3 className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventario y POS</h3>
              <p className="text-gray-600">
                Control de stock, ventas y repuestos con sistema de punto de venta integrado.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Smartphone className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlocks</h3>
              <p className="text-gray-600">
                Gestiona servicios de desbloqueo iCloud, FRP, red y bootloader.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Shield className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-tenant Seguro</h3>
              <p className="text-gray-600">
                Cada tienda tiene sus datos completamente aislados y seguros.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <Clock className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Técnicos y Horarios</h3>
              <p className="text-gray-600">
                Asigna reparaciones a técnicos y controla la productividad del equipo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planes de Suscripción
            </h2>
            <p className="text-lg text-gray-600">
              Elige el plan que mejor se adapte a tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">3 Meses</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-6">$99</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Hasta 5 usuarios
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  100 dispositivos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Todas las funciones
                </li>
              </ul>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                Seleccionar
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-indigo-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">Más Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">6 Meses</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-6">$179</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Hasta 10 usuarios
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  200 dispositivos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Todas las funciones
                </li>
              </ul>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                Seleccionar
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1 Año</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-6">$299</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Usuarios ilimitados
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Dispositivos ilimitados
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                  Todas las funciones
                </li>
              </ul>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-bold">TiendaFix</span>
          </div>
          <p className="text-center text-gray-400 mt-4">
            © 2024 TiendaFix. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
} 