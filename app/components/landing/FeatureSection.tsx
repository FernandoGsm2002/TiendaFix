"use client";

import React from "react";
import Image from "next/image";
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Link, 
  Chip,
  Badge,
  Avatar,
  Progress,
  Divider,
  Tooltip
} from "@heroui/react";
import { 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Star, 
  Sparkles, 
  TrendingUp,
  Shield,
  Clock,
  Target,
  Award,
  Rocket
} from "lucide-react";

interface Feature {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  title: string;
  subtitle?: string;
  description: string;
  features: Feature[];
  imageUrl: string;
  imageAlt: string;
  orientation?: "left" | "right";
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
}

export function FeatureSection({
  title,
  subtitle,
  description,
  features,
  imageUrl,
  imageAlt,
  orientation = "left",
  ctaText,
  ctaLink,
  backgroundColor = "bg-white"
}: FeatureSectionProps) {
  const imageOnLeft = orientation === "left";

  return (
    <section className={`py-24 ${backgroundColor} relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Ultra Modern Content */}
          <div className={`${imageOnLeft ? "lg:order-last" : ""} space-y-8`}>
            {subtitle && (
              <Badge
                content="NUEVA"
                color="danger"
                placement="top-right"
                className="inline-block"
              >
                <Chip
                  startContent={<Sparkles className="w-4 h-4 animate-pulse" />}
                  variant="flat"
                  color="primary"
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 text-base font-bold shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  {subtitle}
                </Chip>
              </Badge>
            )}
            
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>
              
              <Card className="bg-white/80 backdrop-blur-xl shadow-xl border-0 mb-8">
                <CardBody className="p-6">
                  <p className="text-xl text-gray-700 leading-relaxed">
                    {description}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Implementación rápida</span>
                    </div>
                    <Divider orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>100% Seguro</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-xl shadow-lg border-0 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <Avatar
                          icon={feature.icon || <CheckCircle className="w-6 h-6" />}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white group-hover:scale-110 transition-transform duration-300"
                          size="md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-3">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={85 + (index * 5)} 
                            color="primary" 
                            className="flex-1"
                            size="sm"
                            classNames={{
                              indicator: "bg-gradient-to-r from-blue-500 to-purple-500"
                            }}
                          />
                          <Chip size="sm" variant="flat" color="success">
                            {85 + (index * 5)}% Eficaz
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {ctaText && ctaLink && (
              <div className="flex items-center gap-4">
                <Tooltip 
                  content="Comienza ahora y transforma tu taller"
                  placement="top"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  <Button
                    as={Link}
                    href={ctaLink}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold px-8 py-6 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 relative overflow-hidden group border-0"
                    endContent={<Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300" />}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">{ctaText}</span>
                  </Button>
                </Tooltip>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>4.9/5 satisfacción</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Image Section */}
          <div className={`flex justify-center ${imageOnLeft ? "" : "lg:order-last"}`}>
            <div className="relative group">
              <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 p-4 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <CardBody className="p-0">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    width={600}
                    height={400}
                    className="rounded-lg"
                  />
                </CardBody>
              </Card>
              
              {/* Advanced Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                <Card className="bg-white/95 backdrop-blur-xl shadow-xl border-0">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">En Vivo</div>
                        <div className="text-xs text-gray-600">150+ usuarios activos</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 