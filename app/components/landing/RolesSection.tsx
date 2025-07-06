"use client";

import React from "react";
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { User, Wrench, Settings, Crown } from "lucide-react";

export function RolesSection() {
  const roles = [
    {
      id: "manager",
      label: "Gestor de Recepción",
      icon: <User className="w-5 h-5" />,
      content: "Localiza eficientemente a los clientes en la base de datos, procesa pedidos, adjunta fotos del dispositivo y asigna un técnico para el trabajo.",
    },
    {
      id: "technician",
      label: "Técnico Maestro",
      icon: <Wrench className="w-5 h-5" />,
      content: "Extrae tareas de un directorio de servicios completo, descuenta piezas en stock del inventario y marca los componentes faltantes para su adquisición.",
    },
    {
      id: "admin",
      label: "Administrador",
      icon: <Settings className="w-5 h-5" />,
      content: "Gestiona pagos, imprime recibos si es necesario, rastrea ingresos y gastos, y calcula la nómina.",
    },
    {
      id: "owner",
      label: "Propietario",
      icon: <Crown className="w-5 h-5" />,
      content: "Recibe informes perspicaces sobre ingresos, beneficios, rotación de piezas y eficiencia de los empleados.",
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Operaciones Optimizadas para Cada Rol
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Cada miembro de tu equipo tiene las herramientas que necesita para triunfar.
          </p>
        </div>
        <div className="flex w-full flex-col items-center">
          <Tabs aria-label="Roles">
            {roles.map((role) => (
              <Tab
                key={role.id}
                title={
                  <div className="flex items-center space-x-2">
                    {role.icon}
                    <span>{role.label}</span>
                  </div>
                }
              >
                <Card>
                  <CardBody>
                    <p className="text-lg text-center p-4">{role.content}</p>
                  </CardBody>
                </Card>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
} 