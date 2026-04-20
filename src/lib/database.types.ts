/* eslint-disable @typescript-eslint/no-unused-vars */
// Types générés pour Supabase basés sur le schéma de la base de données
// À placer dans src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          table_name: string | null;
          action: string | null;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          table_name?: string | null;
          action?: string | null;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          table_name?: string | null;
          action?: string | null;
          record_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          client_name: string;
          model: string;
          fabric_color: string | null;
          size: string;
          fabric_price: number | null;
          selling_price: number | null;
          profit: number | null;
          delivery_date: string | null;
          delivery_location: string | null;
          order_count: number | null;
          model_image: string | null;
          advance_payment: number | null;
          status: number | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          model: string;
          fabric_color?: string | null;
          size: string;
          fabric_price?: number | null;
          selling_price?: number | null;
          profit?: number | null;
          delivery_date?: string | null;
          delivery_location?: string | null;
          order_count?: number | null;
          model_image?: string | null;
          advance_payment?: number | null;
          status?: number | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          model?: string;
          fabric_color?: string | null;
          size?: string;
          fabric_price?: number | null;
          selling_price?: number | null;
          profit?: number | null;
          delivery_date?: string | null;
          delivery_location?: string | null;
          order_count?: number | null;
          model_image?: string | null;
          advance_payment?: number | null;
          status?: number | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      roles: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role_id: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role_id?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role_id?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'users_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [_ in never]: never;
    };
    Functions: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [_ in never]: never;
    };
    Enums: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [_ in never]: never;
    };
    CompositeTypes: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [_ in never]: never;
    };
  };
}

// Types helper pour les opérations courantes
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Role = Database['public']['Tables']['roles']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Types pour les statuts de commande
export type OrderStatus = 0 | 1 | 2 | 3;

export const ORDER_STATUSES = {
  PENDING: 0,
  IN_PROGRESS: 1,
  DELIVERED: 2,
  CANCELLED: 3,
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'En attente',
  [ORDER_STATUSES.IN_PROGRESS]: 'En cours',
  [ORDER_STATUSES.DELIVERED]: 'Livré',
  [ORDER_STATUSES.CANCELLED]: 'Annulé',
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: '#f59e0b', // orange
  [ORDER_STATUSES.IN_PROGRESS]: '#3b82f6', // blue
  [ORDER_STATUSES.DELIVERED]: '#10b981', // green
  [ORDER_STATUSES.CANCELLED]: '#ef4444', // red
} as const;

// Fonctions utilitaires pour les statuts
export function getOrderStatusLabel(status: OrderStatus | null): string {
  if (status === null) return 'Inconnu';
  return ORDER_STATUS_LABELS[status] || 'Inconnu';
}

export function getOrderStatusColor(status: OrderStatus | null): string {
  if (status === null) return '#6b7280';
  return ORDER_STATUS_COLORS[status] || '#6b7280';
}

// Types pour les formulaires
export interface OrderFormData {
  client_name: string;
  model: string;
  fabric_color: string;
  size: string;
  fabric_price: string;
  selling_price: string;
  delivery_date: string;
  delivery_location?: string;
  order_count?: string;
  model_image?: string;
  advance_payment?: string;
  status?: OrderStatus;
}

// Types pour les statistiques
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  deliveredOrders: number;
}
