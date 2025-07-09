"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Chip,
  Divider,
  Image
} from "@heroui/react";
import { 
  ChevronDown, 
  Smartphone, 
  Award,
  Zap,
  BookOpen,
  HelpCircle,
  Phone,
  ExternalLink,
  Play
} from "lucide-react";

const menuItems = [
  { name: "Inicio", href: "#inicio" },
  { name: "TiendaFix Para Escritorio", href: "https://tiendafixpe.web.app/", external: true },
  { name: "Precios", href: "#precios" },
  { name: "Testimonios", href: "#testimonios" },
  { name: "Contacto", href: "#contacto" },
];



const resourcesDropdown = [
  {
    key: "docs",
    icon: <BookOpen className="w-5 h-5 text-[#013237]" />,
    title: "Documentación",
    description: "Guías y tutoriales completos",
    href: "/docs"
  },
  {
    key: "help",
    icon: <HelpCircle className="w-5 h-5 text-[#013237]" />,
    title: "Centro de Ayuda",
    description: "Preguntas frecuentes y soporte",
    href: "/help"
  }
  
];

const companyDropdown = [
  {
    key: "about",
    icon: <Award className="w-5 h-5 text-[#013237]" />,
    title: "Sobre Nosotros",
    description: "Nuestra historia",
    href: "/about"
  },
  {
    key: "contact",
    icon: <Phone className="w-5 h-5 text-[#013237]" />,
    title: "Contacto",
    description: "Habla con nuestro equipo",
    href: "/contact"
  }
];

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      className="bg-[#f0fdf9]/98 backdrop-blur-xl border-b border-[#c0e6ba]/50 shadow-lg sticky top-0 left-0 right-0 z-50"
      maxWidth="full"
      height="5rem"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#eafae7]/30 via-transparent to-[#c0e6ba]/30 opacity-50"></div>
      
      <NavbarContent className="relative z-10">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-[#4ca771] hover:text-[#013237] transition-colors"
        />
        <NavbarBrand>
          <div className="flex items-center group cursor-pointer">
            <Image
              src="/pngs/tiendafixlogo.png"
              alt="TiendaFix V2 Logo"
              width={180}
              height={135}
              className="transform group-hover:scale-110 transition-all duration-300"
            />
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-8 relative z-10" justify="center">
        <NavbarItem>
          <Link 
            href="#inicio" 
            className="text-[#4ca771] hover:text-[#013237] font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-[#eafae7]"
          >
            <span className="relative z-10">Inicio</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </NavbarItem>
        
        <NavbarItem>
          <Button
            as={Link}
            href="https://tiendafixpe.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            variant="flat"
            color="default"
            className="font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-[#4ca771] to-[#013237] text-white border-0"
            endContent={<ExternalLink className="w-4 h-4" />}
          >
            TiendaFix Para Escritorio
          </Button>
        </NavbarItem>

        <NavbarItem>
          <Link 
            href="#precios" 
            className="text-[#4ca771] hover:text-[#013237] font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-[#eafae7]"
          >
            <span className="relative z-10">Precios</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </NavbarItem>

        <Dropdown 
          backdrop="blur"
          classNames={{
            base: "p-0 bg-[#f0fdf9]/95 backdrop-blur-xl",
            content: "p-0 border-0 shadow-2xl",
          }}
        >
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent text-[#4ca771] hover:text-[#013237] font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-[#eafae7]"
                endContent={<ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />}
                radius="sm"
                variant="light"
              >
                <span className="relative z-10">Tutoriales</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu 
            aria-label="Recursos"
            className="w-80 p-2"
            itemClasses={{
              base: "gap-4 p-4 data-[hover=true]:bg-gradient-to-r data-[hover=true]:from-[#eafae7] data-[hover=true]:to-[#c0e6ba] rounded-lg margin-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
              title: "text-[#013237] font-semibold",
              description: "text-[#4ca771] text-sm"
            }}
          >
            {resourcesDropdown.map((item) => (
              <DropdownItem
                key={item.key}
                description={item.description}
                startContent={
                  <div className="w-10 h-10 bg-gradient-to-r from-[#4ca771] to-[#013237] rounded-lg flex items-center justify-center shadow-md">
                    {item.icon}
                  </div>
                }
                href={item.href}
                className="text-[#013237]"
              >
                {item.title}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown 
          backdrop="blur"
          classNames={{
            base: "p-0 bg-[#f0fdf9]/95 backdrop-blur-xl",
            content: "p-0 border-0 shadow-2xl",
          }}
        >
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent text-[#4ca771] hover:text-[#013237] font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-[#eafae7]"
                endContent={<ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />}
                radius="sm"
                variant="light"
              >
                <span className="relative z-10">Empresa</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu 
            aria-label="Empresa"
            className="w-80 p-2"
            itemClasses={{
              base: "gap-4 p-4 data-[hover=true]:bg-gradient-to-r data-[hover=true]:from-[#eafae7] data-[hover=true]:to-[#c0e6ba] rounded-lg margin-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
              title: "text-[#013237] font-semibold",
              description: "text-[#4ca771] text-sm"
            }}
          >
            {companyDropdown.map((item) => (
              <DropdownItem
                key={item.key}
                description={item.description}
                startContent={
                  <div className="w-10 h-10 bg-gradient-to-r from-[#4ca771] to-[#013237] rounded-lg flex items-center justify-center shadow-md">
                    {item.icon}
                  </div>
                }
                href={item.href}
                className="text-[#013237]"
              >
                {item.title}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarContent justify="end" className="relative z-10">
        <NavbarItem className="hidden lg:flex">
          <Button
            as={Link}
            href="/auth/login"
            variant="light"
            className="text-[#4ca771] hover:text-[#013237] font-medium transition-all duration-300 relative group px-4 py-2 rounded-lg hover:bg-[#eafae7]"
          >
            <span className="relative z-10">Iniciar Sesión</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#eafae7] to-[#c0e6ba] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            as={Link}
            href="/dashboard/demo"
            variant="flat"
            className="text-[#013237] hover:text-[#4ca771] font-medium transition-all duration-300 relative group px-4 py-2 rounded-lg bg-[#eafae7] hover:bg-[#c0e6ba]"
            startContent={<Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />}
          >
            <span className="relative z-10">Ver Demo</span>
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button 
            as={Link} 
            href="/auth/register" 
            className="bg-gradient-to-r from-[#4ca771] to-[#013237] text-white font-semibold px-8 py-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group border-0"
            endContent={<Zap className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">Registrate ahora</span>
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu className="bg-[#f0fdf9]/98 backdrop-blur-xl border-r border-[#c0e6ba]/50 shadow-2xl">
        {/* Mobile Menu Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#eafae7]/30 via-transparent to-[#c0e6ba]/30 opacity-50"></div>
        
        <div className="flex flex-col gap-3 pt-8 px-2 relative z-10">
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.name}-${index}`}>
                          <Link
              className="w-full text-[#4ca771] hover:text-[#013237] font-medium py-4 px-4 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#eafae7] hover:to-[#c0e6ba] hover:shadow-md group"
              href={item.href}
              size="lg"
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#4ca771] rounded-full group-hover:bg-[#013237] group-hover:scale-150 transition-all duration-300"></div>
                <span className="flex-1">{item.name}</span>
                {item.external && <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />}
              </div>
            </Link>
            </NavbarMenuItem>
          ))}
          
          <Divider className="my-6 bg-gradient-to-r from-transparent via-[#c0e6ba] to-transparent" />
          
          <NavbarMenuItem>
            <Button
              as={Link}
              href="/auth/login"
              variant="light"
              className="w-full justify-start text-[#4ca771] hover:text-[#013237] font-medium py-4 px-4 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#eafae7] hover:to-[#c0e6ba] hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#4ca771] rounded-full group-hover:bg-[#013237] group-hover:scale-150 transition-all duration-300"></div>
                <span>Iniciar Sesión</span>
              </div>
            </Button>
          </NavbarMenuItem>
          
          <NavbarMenuItem>
            <Button
              as={Link}
              href="/dashboard/demo"
              variant="flat"
              className="w-full justify-start text-[#013237] hover:text-[#4ca771] font-medium py-4 px-4 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#eafae7] hover:to-[#c0e6ba] hover:shadow-md group bg-[#eafae7]"
              startContent={<Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#4ca771] rounded-full group-hover:bg-[#013237] group-hover:scale-150 transition-all duration-300"></div>
                <span>Ver Demo</span>
              </div>
            </Button>
          </NavbarMenuItem>
          
          <NavbarMenuItem>
            <Button 
              as={Link} 
              href="/auth/register" 
              className="w-full bg-gradient-to-r from-[#4ca771] to-[#013237] text-white font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 py-4 px-6 relative overflow-hidden group border-0"
              endContent={<Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Registrarme ahora</span>
            </Button>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </Navbar>
  );
} 