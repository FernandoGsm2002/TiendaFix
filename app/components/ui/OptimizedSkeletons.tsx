import { Skeleton } from '@heroui/react'

// Skeleton para tarjetas de estadísticas
export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-16 rounded" />
      </div>
    </div>
  )
}

// Skeleton para filas de tabla
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="py-4 px-3">
          <Skeleton className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  )
}

// Skeleton para tarjetas de lista (móvil)
export function ListCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Skeleton className="h-6 w-20 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para formularios
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-20 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}

// Skeleton para header de página
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  )
}

// Skeleton para filtros
export function FiltersSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Skeleton className="h-10 w-full md:w-56 rounded-lg" />
      <Skeleton className="h-10 w-full md:w-32 rounded-lg" />
      <Skeleton className="h-10 w-full md:w-24 rounded-lg" />
    </div>
  )
}

// Skeleton para paginación
export function PaginationSkeleton() {
  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-10 w-8 rounded" />
        <Skeleton className="h-10 w-8 rounded" />
        <Skeleton className="h-10 w-8 rounded" />
        <Skeleton className="h-10 w-10 rounded" />
      </div>
    </div>
  )
}

// Skeleton combinado para páginas completas
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      
      <FiltersSkeleton />
      
      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <Skeleton className="h-6 w-40 rounded" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <PaginationSkeleton />
    </div>
  )
}

// Skeleton para dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      
      {/* Charts/Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <Skeleton className="h-6 w-32 rounded mb-4" />
          <Skeleton className="h-48 w-full rounded" />
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <Skeleton className="h-6 w-40 rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton para modal
export function ModalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>
      
      <FormSkeleton />
    </div>
  )
} 