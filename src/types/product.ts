
export type ProductVariation = {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
};

export type ProductOption = {
  id: string;
  title: string;
  required: boolean;
  maxOptions?: number;
  variations: ProductVariation[];
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedOptions: Record<string, string[]>;
  selectedOptionsPrice?: number;
  totalPrice: number;
};

export type UserRole = 'customer' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
};

export type StoreInfo = {
  name: string;
  description?: string;
  logo: string;
  banner: string;
  deliveryFee: number;
  minOrder: number;
  cuisineType: string;
};

export type OrderStatus = 'pending' | 'processing' | 'delivering' | 'delivered' | 'cancelled';

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions: Record<string, string[]>;
  totalPrice: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type FoodItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  popular?: boolean;
  vegetarian?: boolean;
  hasOptions?: boolean;
  category?: string;
};

// Supabase database types
export type ProductOptionDB = {
  id: string;
  product_id: string;
  title: string;
  required: boolean;
  created_at?: string;
  updated_at?: string;
  option_variations?: OptionVariationDB[];
};

export type OptionVariationDB = {
  id: string;
  option_id: string;
  name: string;
  price: number;
  created_at?: string;
  updated_at?: string;
};

// Supabase Orders Database Type
export type OrderDB = {
  id: string;
  user_id: string;
  items: OrderItem[] | string; // Can be string when first received from database
  status: string; // Changed from OrderStatus to accept any string from the database
  total: number;
  delivery_fee: number;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  } | string; // Can be string when first received from database
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    phone: string;
    email: string;
  } | null | any; // Made more flexible to handle error states or unexpected formats
};
