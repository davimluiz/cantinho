import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { Input, Select } from './components/Input';
import { CATEGORIES, PRODUCTS, PAYMENT_METHODS } from './constants';
import { Category, Product, CustomerInfo, CartItem, PaymentMethod, Order, OrderStatus } from './types';
import { printerService } from './services/printerService';

// --- RECEIPT COMPONENT FOR BROWSER PRINTING ---
const Receipt = ({ order }: { order: Order | null }) => {
    if (!order) return null;

    const date = new Date(order.createdAt).toLocaleString('pt-BR');
    
    // Style helper for dashed lines
    const DashedLine = () => (
        <div className="w-full border-b border-black border-dashed my-2" style={{ borderBottomStyle: 'dashed' }}></div>
    );

    return (
        <div className="w-full max-w-[80mm] mx-auto text-black font-mono text-sm">
            <div className="text-center">
                <h1 className="font-bold text-xl uppercase mb-1">Cantinho da Sandra</h1>
                <p className="text-xs">Lanches & Bebidas</p>
                <DashedLine />
            </div>

            <div className="mb-2">
                <p><strong>Pedido:</strong> #{order.id.slice(-4)}</p>
                <p><strong>Data:</strong> {date}</p>
                <DashedLine />
            </div>

            <div className="mb-2">
                <h2 className="font-bold uppercase mb-1">Cliente</h2>
                <p className="uppercase">{order.customer.name}</p>
                <p>{order.customer.phone}</p>
                {order.customer.address && (
                    <p className="text-xs mt-1">
                        {order.customer.address}
                        {order.customer.reference && ` - Ref: ${order.customer.reference}`}
                    </p>
                )}
                <p className="mt-1 font-bold">Pagamento: {order.customer.paymentMethod}</p>
                <DashedLine />
            </div>

            <div className="mb-2">
                <h2 className="font-bold uppercase mb-1">Itens</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="w-[10%]">Qtd</th>
                            <th className="w-[60%]">Item</th>
                            <th className="w-[30%] text-right">$$</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, idx) => (
                            <tr key={idx} className="align-top">
                                <td>{item.quantity}</td>
                                <td>{item.name}</td>
                                <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <DashedLine />
            </div>

            <div className="text-right text-lg font-bold mb-4">
                TOTAL: R$ {order.total.toFixed(2)}
            </div>

            <div className="text-center text-xs mt-4">
                <p>Obrigado pela preferência!</p>
                <p className="mt-1">***</p>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const HomeView = ({ 
  onStartOrder, 
  onViewHistory, 
  onConnectPrinter, 
  isPrinterConnected 
}: { 
  onStartOrder: () => void, 
  onViewHistory: () => void, 
  onConnectPrinter: () => void, 
  isPrinterConnected: boolean 
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
    <div className="glass-card p-10 rounded-2xl w-full max-w-md mb-8 transform transition-all hover:scale-[1.01]">
      <h1 className="text-5xl font-bold text-[#D6BB56] mb-2 drop-shadow-lg">Cantinho da Sandra</h1>
      <p className="text-gray-300 tracking-wider">Sistema de Pedidos</p>
    </div>
    
    <div className="w-full max-w-md space-y-4">
      <Button onClick={onStartOrder} fullWidth className="text-xl py-6 shadow-xl shadow-yellow-900/20">
        REALIZAR NOVO PEDIDO
      </Button>
      
      <Button onClick={onViewHistory} variant="secondary" fullWidth>
        Ver Histórico de Pedidos
      </Button>

      {/* Optional WebUSB Button if needed later, kept for compatibility */}
      {isPrinterConnected ? (
          <div className="text-green-400 text-sm mt-4 bg-green-900/20 py-2 rounded-lg border border-green-500/30">
              WebUSB Conectado
          </div>
      ) : (
          <button 
            onClick={onConnectPrinter} 
            className="text-xs text-gray-500 mt-8 underline hover:text-[#D6BB56]"
          >
            Configurar WebUSB (Opcional)
          </button>
      )}
    </div>
  </div>
);

const FormView = ({
    customer,
    setCustomer,
    onCancel,
    onSubmit
}: {
    customer: CustomerInfo,
    setCustomer: React.Dispatch<React.SetStateAction<CustomerInfo>>,
    onCancel: () => void,
    onSubmit: (e: React.FormEvent) => void
}) => (
    <div className="max-w-md mx-auto pt-8 px-4 pb-20">
       <div className="glass-card p-6 rounded-2xl">
           <h2 className="text-2xl text-[#D6BB56] font-bold mb-6 text-center">Dados do Cliente</h2>
           <form onSubmit={onSubmit}>
              <Input 
                label="Nome do Cliente *" 
                value={customer.name} 
                onChange={e => setCustomer(prev => ({...prev, name: e.target.value}))}
                placeholder="Ex: João Silva"
              />
              <Input 
                label="Telefone/WhatsApp *" 
                value={customer.phone} 
                onChange={e => setCustomer(prev => ({...prev, phone: e.target.value}))}
                type="tel"
                placeholder="(00) 00000-0000"
              />
              <Input 
                label="Endereço" 
                value={customer.address} 
                onChange={e => setCustomer(prev => ({...prev, address: e.target.value}))}
                placeholder="Rua, Número, Bairro"
              />
              <Input 
                label="Ponto de Referência" 
                value={customer.reference} 
                onChange={e => setCustomer(prev => ({...prev, reference: e.target.value}))}
                placeholder="Ex: Próximo ao mercado"
              />
              <Select 
                label="Forma de Pagamento"
                options={PAYMENT_METHODS}
                value={customer.paymentMethod}
                onChange={e => setCustomer(prev => ({...prev, paymentMethod: e.target.value as PaymentMethod}))}
              />
              
              <div className="flex gap-4 mt-8">
                <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                    Continuar
                </Button>
              </div>
           </form>
       </div>
    </div>
);

const MenuView = ({
    selectedCategory,
    setSelectedCategory,
    categories,
    products,
    cart,
    addToCart,
    updateQuantity,
    cartTotal,
    onViewSummary,
    onBack
}: {
    selectedCategory: string | null,
    setSelectedCategory: (id: string | null) => void,
    categories: Category[],
    products: Product[],
    cart: CartItem[],
    addToCart: (p: Product) => void,
    updateQuantity: (id: string, delta: number) => void,
    cartTotal: number,
    onViewSummary: () => void,
    onBack: () => void
}) => {
    // If category selected, show products
    if (selectedCategory) {
        const categoryProducts = products.filter(p => p.categoryId === selectedCategory);
        const categoryName = categories.find(c => c.id === selectedCategory)?.name;

        return (
            <div className="flex flex-col h-screen">
                <div className="p-4 glass border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
                    <button onClick={() => setSelectedCategory(null)} className="text-[#D6BB56] font-bold">
                        &larr; Voltar
                    </button>
                    <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md">{categoryName}</h2>
                    <div className="w-10"></div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 pb-32">
                    <div className="grid grid-cols-1 gap-4">
                        {categoryProducts.map(product => {
                            const inCart = cart.find(i => i.id === product.id);
                            return (
                                <div key={product.id} className="glass-card p-4 rounded-xl flex justify-between items-center transition-all hover:bg-white/10">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{product.name}</h3>
                                        <p className="text-[#D6BB56]">R$ {product.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {inCart ? (
                                            <>
                                                <button onClick={() => updateQuantity(product.id, -1)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold transition-colors">-</button>
                                                <span className="font-bold w-4 text-center">{inCart.quantity}</span>
                                                <button onClick={() => updateQuantity(product.id, 1)} className="w-8 h-8 rounded-full bg-[#D6BB56] text-[#292927] hover:brightness-110 flex items-center justify-center font-bold transition-colors">+</button>
                                            </>
                                        ) : (
                                            <Button onClick={() => addToCart(product)} className="py-2 px-4 text-sm shadow-none">
                                                Adicionar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
               {/* Cart Summary Bar */}
                {cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t border-[#D6BB56]/30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                        <div className="max-w-md mx-auto flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-300">Total ({cart.length} itens)</p>
                                <p className="text-xl font-bold text-[#D6BB56]">R$ {cartTotal.toFixed(2)}</p>
                            </div>
                            <Button onClick={onViewSummary}>
                                Ver Pedido &rarr;
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Otherwise show categories
    return (
        <div className="max-w-md mx-auto pt-8 px-4">
             <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white">&larr; Voltar</button>
                <h2 className="text-2xl text-[#D6BB56] font-bold">Cardápio</h2>
                <div className="w-10"></div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-95 hover:border-[#D6BB56] hover:bg-white/10 group"
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="font-bold text-lg text-white">{cat.name}</span>
                    </button>
                ))}
             </div>
        </div>
    );
};

const SummaryView = ({
    customer,
    cart,
    cartTotal,
    removeFromCart,
    onBack,
    onFinish
}: {
    customer: CustomerInfo,
    cart: CartItem[],
    cartTotal: number,
    removeFromCart: (id: string) => void,
    onBack: () => void,
    onFinish: () => void
}) => (
    <div className="flex flex-col h-screen">
        <div className="p-4 glass border-b border-white/5 sticky top-0 z-10">
            <h2 className="text-xl text-[#D6BB56] font-bold text-center">Resumo do Pedido</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            <div className="glass-card rounded-xl p-4 mb-4">
                <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Cliente</h3>
                <p className="font-bold text-lg text-white">{customer.name}</p>
                <p className="text-gray-300">{customer.phone}</p>
                {customer.address && <p className="text-gray-400 text-sm mt-1">{customer.address}, {customer.reference}</p>}
                <p className="text-[#D6BB56] font-bold mt-2 text-sm border-t border-white/10 pt-2 inline-block">
                    Pagamento: {customer.paymentMethod}
                </p>
            </div>

            <div className="glass-card rounded-xl p-4 mb-20">
                <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Itens do Pedido</h3>
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center mb-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <div className="flex-1">
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-xs text-gray-400">Unit: R$ {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="font-mono text-gray-300 text-sm">x{item.quantity}</span>
                             <span className="font-bold w-20 text-right text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                             <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 ml-2 px-2 transition-colors">&times;</button>
                        </div>
                    </div>
                ))}
                <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
                    <span className="text-xl font-bold text-white">TOTAL</span>
                    <span className="text-2xl font-bold text-[#D6BB56]">R$ {cartTotal.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div className="p-4 glass border-t border-white/5">
            <div className="flex gap-4 max-w-md mx-auto">
                <Button variant="secondary" onClick={onBack} className="flex-1">
                    Voltar
                </Button>
                <Button onClick={onFinish} className="flex-1 shadow-lg shadow-[#D6BB56]/20">
                    FINALIZAR
                </Button>
            </div>
        </div>
    </div>
);

const HistoryView = ({
    orders,
    onBack,
    onPrint
}: {
    orders: Order[],
    onBack: () => void,
    onPrint: (o: Order) => void
}) => (
    <div className="h-screen flex flex-col">
        <div className="p-4 glass flex justify-between items-center border-b border-white/5 sticky top-0 z-10">
            <button onClick={onBack} className="text-[#D6BB56] font-bold">&larr; Voltar</button>
            <h2 className="text-xl font-bold text-white">Histórico</h2>
            <div className="w-10"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
            {orders.length === 0 ? (
                <div className="glass-card p-8 rounded-xl text-center mt-10">
                    <p className="text-gray-400">Nenhum pedido realizado ainda.</p>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="glass-card rounded-xl p-4 mb-4 border-l-4 border-[#D6BB56] hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-white">{order.customer.name}</h3>
                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                            </div>
                            <span className="bg-[#D6BB56]/20 px-2 py-1 rounded text-xs text-[#D6BB56] border border-[#D6BB56]/50">
                                {order.status}
                            </span>
                        </div>
                        <div className="mb-3">
                            <p className="text-sm text-gray-300 line-clamp-2">
                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <span className="font-bold text-lg text-white">R$ {order.total.toFixed(2)}</span>
                            <button 
                                onClick={() => onPrint(order)}
                                className="text-sm bg-[#D6BB56] text-[#292927] font-bold px-3 py-1 rounded hover:brightness-110 shadow-md"
                            >
                                🖨️ Imprimir
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

// --- MAIN APP COMPONENT ---

type View = 'HOME' | 'FORM' | 'MENU' | 'SUMMARY' | 'HISTORY';

export default function App() {
  const [view, setView] = useState<View>('HOME');
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Current Order State
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    address: '',
    reference: '',
    phone: '',
    paymentMethod: PaymentMethod.PIX
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Printing State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);

  // Load orders from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      try {
        setOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse orders", e);
      }
    }
  }, []);

  // Save orders to local storage
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  // Handle actual browser printing
  useEffect(() => {
    if (receiptOrder) {
        // Small delay to ensure the DOM is updated with the receipt content
        const timer = setTimeout(() => {
            window.print();
            // Reset receipt order after print dialog opens so it doesn't linger
            // Note: browser print blocks execution, so this runs after dialog closes/prints
            // but we'll leave it in state for a moment just in case
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [receiptOrder]);

  // Printer Connection Handler (Legacy WebUSB)
  const connectPrinter = async () => {
    const connected = await printerService.connect();
    setIsPrinterConnected(connected);
    if (connected) {
        alert("Impressora WebUSB conectada.");
    } else {
        alert("WebUSB não disponível. Utilizando driver do navegador.");
    }
  };

  const handleStartOrder = () => {
    setCustomer({
        name: '',
        address: '',
        reference: '',
        phone: '',
        paymentMethod: PaymentMethod.PIX
    });
    setCart([]);
    setView('FORM');
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
        alert("Preencha pelo menos Nome e Telefone.");
        return;
    }
    setView('MENU');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
            return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
        return prev.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        });
    });
  };

  const handlePrint = (order: Order) => {
    // If WebUSB is connected, try that first
    if (isPrinterConnected) {
        printerService.printOrder(order).catch(() => {
            // Fallback to browser print if WebUSB fails
            setReceiptOrder(order);
        });
    } else {
        // Browser print
        setReceiptOrder(order);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const finishOrder = async () => {
    const newOrder: Order = {
        id: Date.now().toString(),
        customer,
        items: cart,
        total: cartTotal,
        createdAt: new Date().toISOString(),
        status: OrderStatus.PENDING
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    
    // Trigger Print
    handlePrint(newOrder);

    setView('HOME');
    // alert("Pedido realizado com sucesso!"); // Optional, print dialog usually confirms action
  };

  return (
    <div className="min-h-screen text-[#EFF0F3] font-sans selection:bg-[#D6BB56] selection:text-[#292927]">
      {/* Hidden print area that becomes visible during window.print() */}
      <div className="printable-area hidden bg-white text-black">
          <Receipt order={receiptOrder} />
      </div>

      <div className="no-print h-full">
        {view === 'HOME' && (
            <HomeView 
                onStartOrder={handleStartOrder}
                onViewHistory={() => setView('HISTORY')}
                onConnectPrinter={connectPrinter}
                isPrinterConnected={isPrinterConnected}
            />
        )}
        
        {view === 'FORM' && (
            <FormView 
                customer={customer}
                setCustomer={setCustomer}
                onSubmit={handleCustomerSubmit}
                onCancel={() => setView('HOME')}
            />
        )}

        {view === 'MENU' && (
            <MenuView 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={CATEGORIES}
                products={PRODUCTS}
                cart={cart}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
                cartTotal={cartTotal}
                onViewSummary={() => setView('SUMMARY')}
                onBack={() => setView('FORM')}
            />
        )}

        {view === 'SUMMARY' && (
            <SummaryView 
                customer={customer}
                cart={cart}
                cartTotal={cartTotal}
                removeFromCart={removeFromCart}
                onBack={() => setView('MENU')}
                onFinish={finishOrder}
            />
        )}

        {view === 'HISTORY' && (
            <HistoryView 
                orders={orders}
                onBack={() => setView('HOME')}
                onPrint={handlePrint}
            />
        )}
      </div>
    </div>
  );
}