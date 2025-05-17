
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
