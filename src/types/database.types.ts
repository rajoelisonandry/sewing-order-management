/* eslint-disable @typescript-eslint/no-unused-vars */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = 0 | 1 | 2 | 3;

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          client_name: string;
          model: string;
          fabric_color: string | null;
          size: string | null;
          fabric_price: number | null;
          selling_price: number | null;
          profit: number | null;
          delivery_date: string | null;
          delivery_location: string | null;
          order_count: number | null;
          model_image: string | null;
          advance_payment: number | null;
          status: OrderStatus | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          model: string;
          fabric_color?: string | null;
          size?: string | null;
          fabric_price?: number | null;
          selling_price?: number | null;
          profit?: number | null;
          delivery_date?: string | null;
          delivery_location?: string | null;
          order_count?: number | null;
          model_image?: string | null;
          advance_payment?: number | null;
          status?: OrderStatus | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          model?: string;
          fabric_color?: string | null;
          size?: string | null;
          fabric_price?: number | null;
          selling_price?: number | null;
          profit?: number | null;
          delivery_date?: string | null;
          delivery_location?: string | null;
          order_count?: number | null;
          model_image?: string | null;
          advance_payment?: number | null;
          status?: OrderStatus | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
