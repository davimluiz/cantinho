import { Category, Product, PaymentMethod } from './types';

// Palette
export const COLORS = {
  bgDark: 'rgb(41, 41, 39)',
  bgSecondary: 'rgb(60, 58, 50)',
  accent: 'rgb(214, 187, 86)',
  textLight: 'rgb(239, 240, 243)',
};

export const CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Hambúrgueres', icon: '🍔' },
  { id: 'drinks', name: 'Bebidas', icon: '🥤' },
  { id: 'sides', name: 'Porções', icon: '🍟' },
];

export const PRODUCTS: Product[] = [
  // Burgers
  { id: 'p1', name: 'X-Burguer', price: 18.00, categoryId: 'burgers' },
  { id: 'p2', name: 'X-Salada', price: 22.00, categoryId: 'burgers' },
  { id: 'p3', name: 'X-Bacon', price: 25.00, categoryId: 'burgers' },
  
  // Drinks
  { id: 'p4', name: 'Coca-Cola Lata', price: 6.00, categoryId: 'drinks' },
  { id: 'p5', name: 'Guaraná Lata', price: 6.00, categoryId: 'drinks' },
  { id: 'p6', name: 'Suco de Laranja', price: 10.00, categoryId: 'drinks' },
  
  // Sides
  { id: 'p7', name: 'Batata Frita P', price: 15.00, categoryId: 'sides' },
  { id: 'p8', name: 'Batata Frita G', price: 25.00, categoryId: 'sides' },
];

export const PAYMENT_METHODS = [
  { value: PaymentMethod.PIX, label: 'PIX' },
  { value: PaymentMethod.CASH, label: 'Dinheiro' },
  { value: PaymentMethod.CARD, label: 'Cartão' },
];