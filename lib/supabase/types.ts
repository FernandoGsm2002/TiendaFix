export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          phone: string | null
          address: string | null
          logo_url: string | null
          subscription_plan: string
          subscription_status: string
          subscription_start_date: string | null
          subscription_end_date: string | null
          max_users: number
          max_devices: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          phone?: string | null
          address?: string | null
          logo_url?: string | null
          subscription_plan?: string
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          max_users?: number
          max_devices?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          phone?: string | null
          address?: string | null
          logo_url?: string | null
          subscription_plan?: string
          subscription_status?: string
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          max_users?: number
          max_devices?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string | null
          email: string
          password_hash: string
          name: string
          role: string
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          email: string
          password_hash: string
          name: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          email?: string
          password_hash?: string
          name?: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          document_type: string | null
          document_number: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          document_type?: string | null
          document_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          document_type?: string | null
          document_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          brand: string
          model: string
          device_type: string
          serial_number: string | null
          imei: string | null
          color: string | null
          storage_capacity: string | null
          operating_system: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          brand: string
          model: string
          device_type: string
          serial_number?: string | null
          imei?: string | null
          color?: string | null
          storage_capacity?: string | null
          operating_system?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string
          brand?: string
          model?: string
          device_type?: string
          serial_number?: string | null
          imei?: string | null
          color?: string | null
          storage_capacity?: string | null
          operating_system?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      repairs: {
        Row: {
          id: string
          organization_id: string
          device_id: string
          customer_id: string
          assigned_technician_id: string | null
          created_by: string | null
          title: string
          description: string | null
          problem_description: string
          solution_description: string | null
          status: string
          priority: string
          estimated_cost: number | null
          final_cost: number | null
          estimated_completion_date: string | null
          actual_completion_date: string | null
          received_date: string
          delivered_date: string | null
          warranty_days: number
          internal_notes: string | null
          customer_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          device_id: string
          customer_id: string
          assigned_technician_id?: string | null
          created_by?: string | null
          title: string
          description?: string | null
          problem_description: string
          solution_description?: string | null
          status?: string
          priority?: string
          estimated_cost?: number | null
          final_cost?: number | null
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          received_date?: string
          delivered_date?: string | null
          warranty_days?: number
          internal_notes?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          device_id?: string
          customer_id?: string
          assigned_technician_id?: string | null
          created_by?: string | null
          title?: string
          description?: string | null
          problem_description?: string
          solution_description?: string | null
          status?: string
          priority?: string
          estimated_cost?: number | null
          final_cost?: number | null
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          received_date?: string
          delivered_date?: string | null
          warranty_days?: number
          internal_notes?: string | null
          customer_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          sku: string | null
          category: string | null
          brand: string | null
          model: string | null
          stock_quantity: number
          min_stock: number
          unit_cost: number | null
          sale_price: number | null
          supplier: string | null
          location: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          sku?: string | null
          category?: string | null
          brand?: string | null
          model?: string | null
          stock_quantity?: number
          min_stock?: number
          unit_cost?: number | null
          sale_price?: number | null
          supplier?: string | null
          location?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          sku?: string | null
          category?: string | null
          brand?: string | null
          model?: string | null
          stock_quantity?: number
          min_stock?: number
          unit_cost?: number | null
          sale_price?: number | null
          supplier?: string | null
          location?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      repair_parts: {
        Row: {
          id: string
          organization_id: string
          repair_id: string
          inventory_id: string
          quantity: number
          unit_cost: number | null
          total_cost: number | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          repair_id: string
          inventory_id: string
          quantity: number
          unit_cost?: number | null
          total_cost?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          repair_id?: string
          inventory_id?: string
          quantity?: number
          unit_cost?: number | null
          total_cost?: number | null
          created_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          organization_id: string
          inventory_id: string
          movement_type: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          inventory_id: string
          movement_type: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          inventory_id?: string
          movement_type?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          organization_id: string
          customer_id: string | null
          created_by: string | null
          sale_type: string
          reference_id: string | null
          subtotal: number
          tax_amount: number
          discount_amount: number
          total: number
          payment_method: string | null
          payment_status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id?: string | null
          created_by?: string | null
          sale_type?: string
          reference_id?: string | null
          subtotal: number
          tax_amount?: number
          discount_amount?: number
          total: number
          payment_method?: string | null
          payment_status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string | null
          created_by?: string | null
          sale_type?: string
          reference_id?: string | null
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total?: number
          payment_method?: string | null
          payment_status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          organization_id: string
          sale_id: string
          inventory_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          sale_id: string
          inventory_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          sale_id?: string
          inventory_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      unlocks: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          device_id: string
          created_by: string | null
          unlock_type: string
          brand: string
          model: string
          imei: string | null
          serial_number: string | null
          status: string
          cost: number | null
          provider: string | null
          provider_order_id: string | null
          completion_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          device_id: string
          created_by?: string | null
          unlock_type: string
          brand: string
          model: string
          imei?: string | null
          serial_number?: string | null
          status?: string
          cost?: number | null
          provider?: string | null
          provider_order_id?: string | null
          completion_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string
          device_id?: string
          created_by?: string | null
          unlock_type?: string
          brand?: string
          model?: string
          imei?: string | null
          serial_number?: string | null
          status?: string
          cost?: number | null
          provider?: string | null
          provider_order_id?: string | null
          completion_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_settings: {
        Row: {
          id: string
          organization_id: string
          setting_key: string
          setting_value: string | null
          setting_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          setting_key: string
          setting_value?: string | null
          setting_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          setting_key?: string
          setting_value?: string | null
          setting_type?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos adicionales para facilidad de uso
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Device = Database['public']['Tables']['devices']['Row']
export type Repair = Database['public']['Tables']['repairs']['Row']
export type InventoryItem = Database['public']['Tables']['inventory']['Row']
export type Sale = Database['public']['Tables']['sales']['Row']
export type Unlock = Database['public']['Tables']['unlocks']['Row']

// Tipos para inserts
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type DeviceInsert = Database['public']['Tables']['devices']['Insert']
export type RepairInsert = Database['public']['Tables']['repairs']['Insert']
export type InventoryInsert = Database['public']['Tables']['inventory']['Insert']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type UnlockInsert = Database['public']['Tables']['unlocks']['Insert']

// Enums para mayor type safety
export type SubscriptionPlan = 'trial' | 'monthly_3' | 'monthly_6' | 'yearly'
export type SubscriptionStatus = 'active' | 'inactive' | 'expired'
export type UserRole = 'owner' | 'admin' | 'technician' | 'employee'
export type DeviceType = 'smartphone' | 'tablet' | 'laptop' | 'desktop' | 'console'
export type RepairStatus = 'received' | 'diagnosed' | 'in_progress' | 'waiting_parts' | 'completed' | 'delivered' | 'cancelled'
export type RepairPriority = 'low' | 'medium' | 'high' | 'urgent'
export type MovementType = 'in' | 'out' | 'adjustment'
export type SaleType = 'product' | 'service' | 'repair'
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed'
export type PaymentStatus = 'pending' | 'paid' | 'partial'
export type UnlockType = 'icloud' | 'frp' | 'network' | 'bootloader'
export type UnlockStatus = 'pending' | 'in_progress' | 'completed' | 'failed' 