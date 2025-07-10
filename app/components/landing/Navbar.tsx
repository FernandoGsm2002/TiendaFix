'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface NavItem {
  label: string
  href: string
  isNew?: boolean
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Detectar scroll para efectos
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      setScrolled(isScrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Items de navegación corregidos según las secciones reales
  const navItems: NavItem[] = [
    {
      label: 'Inicio',
      href: '#hero'
    },
    {
      label: 'Características',
      href: '#features'
    },
    {
      label: 'Precios',
      href: '#precios'
    },
    {
      label: 'Demo',
      href: '/dashboard/demo',
      isNew: true
    }
  ]

  // Manejar click en items de navegación
  const handleNavClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    setIsMenuOpen(false)
    
    if (href.startsWith('#')) {
      const targetId = href === '#precios' ? 'pricing' : href.substring(1)
      const element = document.getElementById(targetId) || document.querySelector(href)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        })
      }
    } else {
      window.location.href = href
    }
  }

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled 
        ? 'bg-white shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo más grande */}
          <Link href="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
            <Image
              src="/pngs/tiendafixlogo.png"
              alt="TiendaFix"
              width={56}
              height={56}
              className="transition-all duration-300"
              priority
            />
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">
              TiendaFix
            </span>
          </Link>

          {/* Navegación Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
                className={`
                  text-base font-medium transition-colors duration-200
                  ${scrolled ? 'text-gray-700 hover:text-green-600' : 'text-gray-800 hover:text-green-600'}
                  ${item.isNew ? 'relative' : ''}
                `}
              >
                {item.label}
                {item.isNew && (
                  <span className="absolute -top-2 -right-6 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Nuevo
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              href="/auth/login"
              className={`
                px-4 py-2 text-base font-medium transition-colors duration-200
                ${scrolled ? 'text-gray-700 hover:text-green-600' : 'text-gray-800 hover:text-green-600'}
              `}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Registrarse
            </Link>
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-b border-gray-200">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)}
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                >
                  <span className="flex items-center">
                    {item.label}
                    {item.isNew && (
                      <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Nuevo
                      </span>
                    )}
                  </span>
                </a>
              ))}
              
              <div className="pt-4 space-y-3 border-t border-gray-200">
                <Link
                  href="/auth/login"
                  className="block text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="block bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-center hover:bg-green-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
         </nav>
   )
 } 