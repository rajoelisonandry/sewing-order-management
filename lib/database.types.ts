export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          client_name: string;
          model: string;
          fabric_color: string;
          size: string;
          fabric_price: number;
          selling_price: number;
          profit: number;
          created_at: string;
          updated_at: string;
          delivery_date: string | null; // ajouté
        };
        Insert: {
          id?: string;
          client_name: string;
          model: string;
          fabric_color: string;
          size: string;
          fabric_price: number;
          selling_price: number;
          created_at?: string;
          updated_at?: string;
          delivery_date?: string | null; // ajouté
        };
        Update: {
          id?: string;
          client_name?: string;
          model?: string;
          fabric_color?: string;
          size?: string;
          fabric_price?: number;
          selling_price?: number;
          updated_at?: string;
          delivery_date?: string | null; // ajouté
        };
      };
    };
  };
}
