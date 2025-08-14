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

export type Product = {
  id: number;
  profile_id: number | null;
  name: string;
  category: string;
  price: number;
  product_image?: string | null;
  description?: string | null;
  supplier?: string | null;
  updated_at: string;
  created_at: string;
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
  price?: number;
};
export type ProductWithInventory = Product & {
  inventory: {
    srp: number | null;
    stock: number;
    sku: string;
  }[];
};
export type DebtorProduct = {
  id: number;
  profile_id?: number | null;
  product_name?: string;
  debtor_id: string;
  product_id: number;
  quantity: number;
  total_price: number;
  created_at: string;
  updated_at: string;
};
export type Debtor = {
  id?: string; // UUID
  name: string;
  email: string;
  phone: string;

  due_date: string; // timestamp
  status: string;
  payment_history?: any[] | null; // jsonb
  avatar?: string | null;
  credit_limit: number;
  unique_code: string;
  created_at: string | null;
  updated_at: string | null;
  profile_id?: number | null;
  balance: number;
  is_settled?: boolean;
  is_archived?: boolean;
};

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  order_id: number;
  products: {
    name: string;
    price: number;
    sku: string;
  };
}

export interface Order {
  id: number;
  customer_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'gcash' | null;
  created_at: string;
  updated_at: string;
  debtor_id: string | null;
  debtors?: {
    name: string;
    phone: string;
  };
  order_items: OrderItem[];
}

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
export enum TransactionType {
  FullSettlement = 'full_settlement',
  PartialPayment = 'partial_payment',
  Refund = 'refund',
}

export type PaymentMethod = 'cash' | 'bank_transfer';
