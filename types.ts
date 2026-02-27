
export type OrderStatus = 'PENDING' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMode: 'UPI' | 'COD';
  upiDetails?: {
    provider: string;
    upiId: string;
  };
  status: OrderStatus;
  createdAt: string;
  etaMinutes: number;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
}

export type ViewState = 'SPLASH' | 'AUTH' | 'DASHBOARD' | 'MENU' | 'CART' | 'TRACKING' | 'ADMIN';
