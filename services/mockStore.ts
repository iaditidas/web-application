
import { Order, User, OrderStatus } from '../types.ts';

const ORDERS_KEY = 'flash_man_orders';
const USER_KEY = 'flash_man_user';
const HOURS_KEY = 'flash_man_hours';
const KITCHEN_STATUS_KEY = 'flash_man_kitchen_status';
const ADMIN_UPI_KEY = 'flash_man_admin_upi';

const safeGet = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('LocalStorage access blocked:', e);
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('LocalStorage write blocked:', e);
  }
};

export const mockStore = {
  getOrders: (): Order[] => {
    const data = safeGet(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveOrder: (order: Order) => {
    const orders = mockStore.getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    if (existingIndex > -1) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }
    safeSet(ORDERS_KEY, JSON.stringify(orders));
  },
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const orders = mockStore.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
      orders[index].status = status;
      safeSet(ORDERS_KEY, JSON.stringify(orders));
    }
  },
  getUser: (): User | null => {
    const data = safeGet(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User | null) => {
    if (user) {
      safeSet(USER_KEY, JSON.stringify(user));
    } else {
      try {
        localStorage.removeItem(USER_KEY);
      } catch (e) {}
    }
  },
  getOperationalHours: () => {
    const data = safeGet(HOURS_KEY);
    return data ? JSON.parse(data) : { start: 9, end: 17 };
  },
  setOperationalHours: (hours: { start: number, end: number }) => {
    safeSet(HOURS_KEY, JSON.stringify(hours));
  },
  getKitchenStatus: () => {
    const data = safeGet(KITCHEN_STATUS_KEY);
    return data ? JSON.parse(data) : true;
  },
  setKitchenStatus: (status: boolean) => {
    safeSet(KITCHEN_STATUS_KEY, JSON.stringify(status));
  },
  getAdminUpi: () => {
    return safeGet(ADMIN_UPI_KEY) || 'flashman@okaxis';
  },
  setAdminUpi: (upiId: string) => {
    safeSet(ADMIN_UPI_KEY, upiId);
  }
};
