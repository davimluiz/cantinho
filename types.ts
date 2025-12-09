export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'DINHEIRO',
  CARD = 'CARTÃO'
}

export enum OrderStatus {
  PENDING = 'PENDENTE',
  COMPLETED = 'CONCLUÍDO',
  CANCELLED = 'CANCELADO'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Emoji or simple text representation
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  reference: string;
  phone: string;
  paymentMethod: PaymentMethod;
}

export interface Order {
  id: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  createdAt: string; // ISO String
  status: OrderStatus;
}