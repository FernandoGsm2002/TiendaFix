'use client'

import React from 'react'
import PatternLock from './PatternLock'

interface DeviceTicketProps {
  organizationInfo: {
    name?: string
    logo_url?: string
  }
  customerName: string
  repairId: string
  unlockType?: 'pin' | 'pattern' | 'none' | 'other'
  devicePin?: string
  devicePattern?: number[]
}

const DeviceTicket: React.FC<DeviceTicketProps> = ({
  organizationInfo,
  customerName,
  repairId,
  unlockType = 'none',
  devicePin = '',
  devicePattern = []
}) => {
  
  const generateDeviceTicketHTML = () => {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: 85mm 54mm;
            margin: 2mm;
          }
          body {
            font-family: 'Arial', sans-serif;
            font-size: 9px;
            line-height: 1.1;
            margin: 0;
            padding: 2mm;
            width: 81mm;
            height: 50mm;
            color: black;
            background: white;
            display: flex;
            flex-direction: column;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2mm;
            border-bottom: 1px solid #ddd;
            padding-bottom: 1mm;
          }
          .logo-section {
            display: flex;
            align-items: center;
            gap: 2mm;
          }
          .logo {
            max-width: 15mm;
            max-height: 8mm;
            object-fit: contain;
          }
          .store-name {
            font-weight: bold;
            font-size: 10px;
            color: #333;
          }
          .ticket-id {
            font-size: 8px;
            color: #666;
            text-align: right;
          }
          .content {
            flex: 1;
            display: flex;
            justify-content: space-between;
            gap: 3mm;
          }
          .left-section {
            flex: 1;
          }
          .right-section {
            width: 25mm;
            border-left: 1px solid #eee;
            padding-left: 2mm;
          }
          .field {
            margin-bottom: 1.5mm;
          }
          .field-label {
            font-weight: bold;
            font-size: 8px;
            color: #555;
            margin-bottom: 0.5mm;
          }
          .field-value {
            font-size: 9px;
            color: #333;
            word-break: break-word;
          }
          .unlock-section {
            text-align: center;
          }
          .pattern-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1mm;
            width: 18mm;
            height: 18mm;
            margin: 1mm auto;
            border: 1px solid #ddd;
            padding: 1mm;
          }
          .pattern-dot {
            width: 4mm;
            height: 4mm;
            border: 1px solid #ccc;
            border-radius: 50%;
            background: white;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6px;
            font-weight: bold;
          }
          .pattern-dot.selected {
            background: #22c55e;
            border-color: #16a34a;
            color: white;
          }
          .pin-input {
            border: 1px solid #ddd;
            padding: 1mm;
            text-align: center;
            font-size: 12px;
            width: 18mm;
            height: 6mm;
            margin: 1mm auto;
            display: block;
          }
          .date {
            font-size: 7px;
            color: #999;
            text-align: center;
            margin-top: auto;
            padding-top: 1mm;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            ${organizationInfo.logo_url ? `
              <img src="${organizationInfo.logo_url}" alt="Logo" class="logo" />
            ` : ''}
            <div class="store-name">${organizationInfo.name || 'TiendaFix'}</div>
          </div>
          <div class="ticket-id">
            #${repairId.slice(0, 6).toUpperCase()}
          </div>
        </div>

        <div class="content">
          <div class="left-section">
            <div class="field">
              <div class="field-label">CLIENTE:</div>
              <div class="field-value">${customerName}</div>
            </div>
            
            <div class="field">
              <div class="field-label">FECHA:</div>
              <div class="field-value">${currentDate}</div>
            </div>
          </div>

          <div class="right-section">
            <div class="unlock-section">
              <div class="field-label">DESBLOQUEO:</div>
              
              ${unlockType === 'pin' ? `
                <div style="margin-top: 2mm;">
                  <div style="font-size: 8px; margin-bottom: 1mm;">PIN:</div>
                  <div class="pin-input">${devicePin || '____'}</div>
                </div>
              ` : ''}
              
              ${unlockType === 'pattern' ? `
                <div style="margin-top: 2mm;">
                  <div style="font-size: 8px; margin-bottom: 1mm;">PATRÓN:</div>
                  <div class="pattern-grid">
                    ${Array.from({length: 9}, (_, i) => {
                      const pointNumber = i + 1
                      const isSelected = devicePattern.includes(pointNumber)
                      const order = devicePattern.indexOf(pointNumber) + 1
                      return `
                        <div class="pattern-dot ${isSelected ? 'selected' : ''}">
                          ${isSelected ? order : ''}
                        </div>
                      `
                    }).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${unlockType === 'none' || unlockType === 'other' ? `
                <div style="margin-top: 2mm; font-size: 8px; text-align: center;">
                  ${unlockType === 'none' ? 'Sin bloqueo' : 'Otro método'}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="date">
          Ticket generado: ${new Date().toLocaleString('es-ES')}
        </div>
      </body>
      </html>
    `
  }

  const handlePrint = () => {
    const ticketHTML = generateDeviceTicketHTML()
    
    // Crear ventana para impresión
    const printWindow = window.open('', '_blank', 'width=300,height=200') as unknown as Window | null
    if (printWindow && printWindow.document) {
      printWindow.document.write(ticketHTML)
      printWindow.document.close()
      printWindow.focus()
      
      // Esperar que se cargue el contenido y luego imprimir
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const handleDownload = () => {
    const ticketHTML = generateDeviceTicketHTML()
    const blob = new Blob([ticketHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-dispositivo-${repairId.slice(0, 8)}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Vista previa del ticket */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Vista previa - Ticket del dispositivo
        </h3>
        
        <div 
          className="bg-white border border-gray-300 rounded shadow-sm mx-auto"
          style={{ 
            width: '85mm', 
            height: '54mm', 
            padding: '2mm',
            fontSize: '9px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
            <div className="flex items-center gap-2">
              {organizationInfo.logo_url && (
                <img 
                  src={organizationInfo.logo_url} 
                  alt="Logo" 
                  className="w-4 h-4 object-contain"
                />
              )}
              <span className="font-bold text-xs">{organizationInfo.name || 'TiendaFix'}</span>
            </div>
            <span className="text-xs text-gray-600">#{repairId.slice(0, 6).toUpperCase()}</span>
          </div>

          {/* Content */}
          <div className="flex justify-between gap-3 h-full">
            <div className="flex-1">
              <div className="mb-2">
                <div className="text-xs font-semibold text-gray-600">CLIENTE:</div>
                <div className="text-xs">{customerName}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600">FECHA:</div>
                <div className="text-xs">{new Date().toLocaleDateString('es-ES')}</div>
              </div>
            </div>

            <div className="w-20 border-l border-gray-200 pl-2">
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">DESBLOQUEO:</div>
                
                {unlockType === 'pin' && (
                  <div>
                    <div className="text-xs mb-1">PIN:</div>
                    <div className="border border-gray-300 rounded px-2 py-1 text-center text-xs">
                      {devicePin || '____'}
                    </div>
                  </div>
                )}
                
                {unlockType === 'pattern' && (
                  <div>
                    <div className="text-xs mb-1">PATRÓN:</div>
                    <PatternLock 
                      value={devicePattern}
                      size="sm"
                      disabled={true}
                      className="scale-75"
                    />
                  </div>
                )}
                
                {(unlockType === 'none' || unlockType === 'other') && (
                  <div className="text-xs">
                    {unlockType === 'none' ? 'Sin bloqueo' : 'Otro método'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Imprimir Ticket Dispositivo
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
        >
          Descargar HTML
        </button>
      </div>
    </div>
  )
}

export default DeviceTicket 