import React from 'react'
import DemoLayout from './components/DemoLayout'

export default function DemoLayoutWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <DemoLayout>
      {children}
    </DemoLayout>
  )
} 