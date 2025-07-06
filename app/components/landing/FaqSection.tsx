"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";

const faqs = [
  {
    question: "¿Qué es TiendaFix?",
    answer:
      "TiendaFix es un software especializado diseñado para talleres de reparación de teléfonos móviles, ofreciendo herramientas avanzadas de gestión, control de reparaciones y soporte técnico.",
  },
  {
    question: "¿Cómo puede ayudar TiendaFix a mi taller de móviles?",
    answer:
      "TiendaFix proporciona un sistema de gestión avanzado que facilita el seguimiento de las reparaciones, la comunicación con los clientes y la administración general del taller, mejorando la eficiencia y la satisfacción del cliente.",
  },
  {
    question: "¿Está TiendaFix disponible en España, México y otros países hispanohablantes?",
    answer: "Sí, TiendaFix está disponible y optimizado para todos los países de habla hispana, incluyendo España, México, Argentina, entre otros.",
  },
  {
    question: "¿Es seguro guardar información de clientes en TiendaFix?",
    answer: "Absolutamente. La seguridad es una de nuestras principales prioridades. Utilizamos protocolos de encriptación avanzados para proteger todos los datos almacenados en nuestra plataforma.",
  },
  {
    question: "¿Puedo integrar TiendaFix con otras herramientas que ya uso en mi taller?",
    answer: "Sí, TiendaFix es compatible con varias integraciones, facilitando la sincronización con otras herramientas o sistemas que puedas estar utilizando.",
  },
];


export function FaqSection() {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            ¿Tienes dudas? Aquí encontrarás las respuestas que buscas.
          </p>
        </div>
        <div className="mt-12">
          <Accordion variant="splitted">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} aria-label={faq.question} title={faq.question}>
                {faq.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
} 