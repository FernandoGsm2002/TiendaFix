'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardBody, Chip, Skeleton } from '@heroui/react'
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudDrizzle, 
  CloudLightning,
  MapPin
} from 'lucide-react'

interface WeatherData {
  location: string
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'clear': return <Sun className="h-5 w-5" />
    case 'clouds': return <Cloud className="h-5 w-5" />
    case 'rain': return <CloudRain className="h-5 w-5" />
    case 'snow': return <CloudSnow className="h-5 w-5" />
    case 'drizzle': return <CloudDrizzle className="h-5 w-5" />
    case 'thunderstorm': return <CloudLightning className="h-5 w-5" />
    default: return <Sun className="h-5 w-5" />
  }
}

const getGreetingMessage = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '¡Buenos días'
  if (hour < 18) return '¡Buenas tardes'
  return '¡Buenas noches'
}

export default function WelcomeHeader() {
  const { userProfile, loading } = useAuth()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true)
        
        // Intentar obtener ubicación del usuario
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              
              // Datos simulados basados en ubicación real
              const mockWeather: WeatherData = {
                location: 'Ciudad de México',
                temperature: Math.floor(Math.random() * 15) + 15, // 15-30°C
                condition: 'Clear',
                description: 'Soleado',
                humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
                windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
                icon: '01d'
              }
              
              // Simular delay de API
              setTimeout(() => {
                setWeather(mockWeather)
                setWeatherLoading(false)
              }, 1500)
            },
            () => {
              // Si no se puede obtener ubicación, usar datos por defecto
              const mockWeather: WeatherData = {
                location: 'Tu ubicación',
                temperature: 20,
                condition: 'Clear',
                description: 'Despejado',
                humidity: 60,
                windSpeed: 5,
                icon: '01d'
              }
              
              setTimeout(() => {
                setWeather(mockWeather)
                setWeatherLoading(false)
              }, 1000)
            },
            {
              timeout: 10000, // 10 segundos de timeout
              enableHighAccuracy: false,
              maximumAge: 600000 // 10 minutos de cache
            }
          )
        } else {
          // Navegador no soporta geolocalización
          const mockWeather: WeatherData = {
            location: 'Tu ubicación',
            temperature: 20,
            condition: 'Clear',
            description: 'Despejado',
            humidity: 60,
            windSpeed: 5,
            icon: '01d'
          }
          
          setTimeout(() => {
            setWeather(mockWeather)
            setWeatherLoading(false)
          }, 500)
        }
      } catch (error) {
        console.error('Error fetching weather:', error)
        setWeatherLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3 rounded-lg" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
      </div>
    )
  }

  const userName = userProfile?.name || 'Usuario'
  const organizationName = userProfile?.organization_name || 'Tu Negocio'

  return (
    <div className="space-y-6">
      {/* Bienvenida Principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#013237] tracking-tight">
              {getGreetingMessage()}, {userName}! 👋🏻
            </h1>
          </div>
        </div>

        {/* Widget de Clima y Tiempo */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Hora Actual */}
          <Card className="bg-gradient-to-br from-[#f0fdf9] to-[#eafae7] border border-[#c0e6ba]/50 shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#013237]">
                    {currentTime.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-xs text-[#4ca771]">
                    {currentTime.toLocaleDateString('es-ES', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Información del Clima */}
          <Card className="bg-gradient-to-br from-[#f0fdf9] to-[#eafae7] border border-[#c0e6ba]/50 shadow-lg">
            <CardBody className="p-4">
              {weatherLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ) : weather ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#c0e6ba]/50 text-[#013237]">
                    {getWeatherIcon(weather.condition)}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#013237]">{weather.temperature}°C</span>
                      <Chip 
                        variant="flat" 
                        size="sm" 
                        className="bg-[#c0e6ba]/30 text-[#013237] text-xs"
                      >
                        {weather.description}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-[#4ca771]" />
                      <span className="text-xs text-[#4ca771]">{weather.location}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#c0e6ba]/50 text-[#013237]">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-lg font-bold text-[#013237]">--°C</span>
                    <p className="text-xs text-[#4ca771]">No disponible</p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>


    </div>
  )
} 