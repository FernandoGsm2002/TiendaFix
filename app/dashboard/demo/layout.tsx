import React from 'react'

export default function DemoLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="pt-16"> {/* Padding para el header fijo */}
      {children}
    </div>
  )
} 