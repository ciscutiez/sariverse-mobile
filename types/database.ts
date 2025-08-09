export type Transaction = {
  id: number;
  debtor_id: string;
  profile_id: number | null;
  amount: number;
  payment_method: 'cash' | 'gcash';
  customer_name: string;
  remaining_balance: number;
  is_settled: boolean;
  created_at: string;
  metadata: Record<string, any> | null;
  is_deleted: boolean;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  profile_id: number | null;
};

export type Inventory = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  status: 'in_stock' | 'out_of_stock' | 'low_stock';
  last_updated: string;
  supplier: string;
  created_at: string;
  product_id: number | null;
  srp: number | null;
  profile_id: number;
};

export type DebtorProduct = {
  id: number;
  debtor_id: string;
  product_id: number;
  quantity: number;
  total_price: number;
  created_at: string;
  updated_at: string;
};
export type Debtor = {
  id: number;
  debtor_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
    is_settled?: boolean;
};

export type Product = {
  id: number;
  profile_id: number | null;
  name: string;
  category: string;
  price: number;
  product_image?: string | null;
  description: string | null;
  supplier: string | null;
  updated_at: string; 
  created_at: string; 
};
export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type Order = {
  id: number;
  customer_name: string;
  debtor_id?: number;
  total_price: number;
 status: OrderStatus;
  payment_method: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: number;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  store_name: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
};
