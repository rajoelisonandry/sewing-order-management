export interface Order {
  id: string;
  client_name: string;
  model: string;
  fabric_color: string;
  size: string;
  fabric_price: number;
  selling_price: number;
  profit: number;
  delivery_date: string | null;
  delivery_location: string | null;
  order_count: number | null;
  model_image: string | null;
  advance_payment: number | null;
  status: number | null;
  created_at: string;
  updated_at: string;
}

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
  status?: number;
}
