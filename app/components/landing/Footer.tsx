"use client";

import React from "react";
import { Link, Button } from "@heroui/react";
import { 
  Smartphone, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  ArrowRight,
  Unlock,
  UserCheck,
  Star,
  Globe
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const specialties = [
    { name: "Reparación de Smartphones", href: "#smartphones" },
    { name: "Reparación de Tablets", href: "#tablets" },
    { name: "Control de Desbloqueos", href: "#desbloqueos" },
    { name: "Asignación de Trabajos", href: "#trabajos" }
  ];

  const features = [
    { name: "Sistema POS Integrado", href: "#pos" },
    { name: "Inventario Inteligente", href: "#inventario" },
    { name: "Seguimiento de Reparaciones", href: "#seguimiento" },
    { name: "Gestión de Técnicos", href: "#tecnicos" },
    { name: "Reportes y Analytics", href: "#reportes" },
    { name: "WhatsApp Business", href: "#whatsapp" }
  ];

  const resources = [
    { name: "Centro de Ayuda", href: "/help" },
    { name: "Demo Gratis", href: "/dashboard/demo" },
    { name: "Documentación", href: "/docs" },
    { name: "Blog", href: "/blog" },
    { name: "API", href: "/api" },
    { name: "Soporte 24/7", href: "/support" }
  ];

  const company = [
    { name: "Sobre Nosotros", href: "/about" },
    { name: "Contacto", href: "/contact" },
    { name: "Carreras", href: "/careers" },
    { name: "Testimonios", href: "#testimonios" },
    { name: "Precios", href: "#precios" },
    { name: "Términos de Servicio", href: "/terms" }
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/20"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">TiendaFix</span>
                <p className="text-xs text-gray-400">Software para Talleres</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              El único software 100% especializado en reparación de móviles y tablets. 
              Con funcionalidades exclusivas que no encontrarás en ningún otro lugar.
            </p>
            
            {/* Unique Features */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs">
                <Unlock className="w-3 h-3" />
                <span>Control de Desbloqueos</span>
              </div>
              <div className="flex items-center gap-1 bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs">
                <UserCheck className="w-3 h-3" />
                <span>Asignación de Trabajos</span>
              </div>
              <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs">
                <Star className="w-3 h-3" />
                <span>+2 Meses en el Mercado</span>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300 group hover:text-white transition-colors">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">fernandoapple2002@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 group hover:text-white transition-colors">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">+51 998 936 755</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 group hover:text-white transition-colors">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Lima, Perú</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-400 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-700 transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 transition-all duration-300">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Especialidades */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Especialidades</h3>
            <ul className="space-y-3">
              {specialties.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Funcionalidades */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Funcionalidades</h3>
            <ul className="space-y-3">
              {features.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Recursos</h3>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Empresa</h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para revolucionar tu taller?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Únete a los 100+ talleres que ya confían en TiendaFix para gestionar sus reparaciones de móviles y tablets.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                as={Link}
                href="/auth/register"
                size="lg"
                className="bg-white text-blue-600 font-bold hover:bg-gray-100 shadow-lg"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Comenzar Gratis
              </Button>
              <Button 
                as={Link}
                href="/dashboard/demo"
                size="lg"
                variant="bordered"
                className="border-white text-white hover:bg-white/10"
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>© {currentYear} TiendaFix. Todos los derechos reservados.</span>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Hecho en Perú para Sudamérica</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Términos
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 