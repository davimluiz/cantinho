import React, { useState, useEffect } from 'react';
import { Button } from './components/Button';
import { Input, Select } from './components/Input';
import { 
    CATEGORIES, PRODUCTS, PAYMENT_METHODS, ORDER_TYPES, 
    EXTRAS_OPTIONS, FRANGUINHO_SIDES,
    ACAI_PACKAGING, ACAI_COMPLEMENTS, ACAI_TOPPINGS, ACAI_FRUITS, ACAI_PAID_EXTRAS
} from './constants';
import { Category, Product, CustomerInfo, CartItem, PaymentMethod, Order, OrderStatus, OrderType } from './types';
import { printerService } from './services/printerService';

// --- TYPES FOR DRAFTS ---
type OrderStep = 'MENU' | 'FORM' | 'SUMMARY';

interface OrderDraft {
    id: string;
    customer: CustomerInfo;
    cart: CartItem[];
    step: OrderStep;
    updatedAt: number;
}

// --- RECEIPT COMPONENT ---
const Receipt = ({ order }: { order: Order | null }) => {
    if (!order) return null;

    const date = new Date(order.createdAt).toLocaleString('pt-BR');
    const DashedLine = () => (
        <div className="w-full border-b border-black border-dashed my-2" style={{ borderBottomStyle: 'dashed' }}></div>
    );

    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = order.customer.deliveryFee || 0;

    return (
        <div className="w-full max-w-[80mm] mx-auto text-black font-mono text-sm p-2">
            <div className="text-center">
                <h1 className="font-bold text-xl uppercase mb-1">Cantinho da Sandra</h1>
                <p className="text-xs">Lanches & Bebidas</p>
                <DashedLine />
            </div>

            <div className="mb-2">
                <div className="flex justify-between items-center font-bold text-lg">
                    <span>#{order.id.slice(-4)}</span>
                    <span className="uppercase">{order.customer.orderType} {order.customer.tableNumber ? `#${order.customer.tableNumber}` : ''}</span>
                </div>
                <p className="text-xs mt-1">{date}</p>
                <DashedLine />
            </div>

            <div className="mb-2">
                <h2 className="font-bold uppercase mb-1">Cliente</h2>
                <p className="uppercase font-bold">{order.customer.name}</p>
                <p>{order.customer.phone}</p>
                
                {order.customer.orderType === OrderType.DELIVERY && (
                    <div className="mt-1 text-xs">
                        <p>{order.customer.address}, {order.customer.addressNumber}</p>
                        {order.customer.reference && <p>Ref: {order.customer.reference}</p>}
                    </div>
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
                            <React.Fragment key={idx}>
                                <tr className="align-top font-bold">
                                    <td>{item.quantity}</td>
                                    <td>
                                        {item.name}
                                        {item.packaging && <div className="text-[10px] uppercase font-normal text-black/70">[{item.packaging}]</div>}
                                        {item.observation && <div className="text-[10px] uppercase font-normal text-black/70">* {item.observation}</div>}
                                    </td>
                                    <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                                {(item.removedIngredients?.length > 0 || item.additions?.length > 0) && (
                                    <tr>
                                        <td></td>
                                        <td colSpan={2} className="text-xs pb-1">
                                            {item.removedIngredients?.map(ing => <div key={`rem-${ing}`}>- SEM {ing.toUpperCase()}</div>)}
                                            {item.additions?.map(add => <div key={`add-${add}`}>+ COM {add.toUpperCase()}</div>)}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                <DashedLine />
            </div>

            {order.customer.observation && (
                <div className="mb-2 text-xs">
                    <p className="font-bold uppercase">Obs. Pedido:</p>
                    <p>{order.customer.observation}</p>
                    <DashedLine />
                </div>
            )}

            <div className="flex flex-col items-end text-right mb-4">
                <div className="w-full flex justify-between text-xs mb-1">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {order.customer.orderType === OrderType.DELIVERY && (
                    <div className="w-full flex justify-between text-xs mb-1 font-bold">
                        <span>Taxa de Entrega:</span>
                        <span>R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                )}
                <div className="w-full flex justify-between text-lg font-bold border-t border-black border-dashed pt-1 mt-1">
                    <span>TOTAL:</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                </div>
            </div>

            {order.customer.usePaidStamp && (
                <div className="text-center mt-4 border border-black p-2 font-bold uppercase text-lg">CARIMBO DE PAGO</div>
            )}

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
  drafts,
  onSelectDraft,
  onDeleteDraft
}: { 
  onStartOrder: () => void, 
  onViewHistory: () => void,
  drafts: OrderDraft[],
  onSelectDraft: (id: string) => void,
  onDeleteDraft: (id: string) => void
}) => (
  <div className="flex flex-col items-center min-h-screen px-4 py-8">
    <div className="glass-card p-8 rounded-2xl w-full max-w-md mb-8 text-center">
      <h1 className="text-4xl font-bold text-[#D6BB56] mb-1 drop-shadow-lg">Cantinho da Sandra</h1>
      <p className="text-gray-400 text-sm tracking-wider">Sistema de Pedidos Interno</p>
    </div>
    
    <div className="w-full max-w-md space-y-6">
      <Button onClick={onStartOrder} fullWidth className="text-xl py-6 shadow-xl shadow-yellow-900/20">
        NOVO PEDIDO ➕
      </Button>

      {drafts.length > 0 && (
          <div className="space-y-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Pedidos em Aberto ({drafts.length})</h2>
              {drafts.sort((a,b) => b.updatedAt - a.updatedAt).map(draft => (
                  <div key={draft.id} className="glass-card p-4 rounded-xl flex justify-between items-center group animate-fade-in border-l-4 border-yellow-500">
                      <div className="flex-1 cursor-pointer" onClick={() => onSelectDraft(draft.id)}>
                          <p className="font-bold text-white text-lg">{draft.customer.name || `Novo Pedido #${draft.id.slice(-4)}`}</p>
                          <p className="text-xs text-gray-400">
                              {draft.cart.length} itens - Atualizado {new Date(draft.updatedAt).toLocaleTimeString('pt-BR')}
                          </p>
                      </div>
                      <button 
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-2 text-red-500 opacity-50 hover:opacity-100 transition-opacity"
                        title="Remover rascunho"
                      >
                        🗑️
                      </button>
                  </div>
              ))}
          </div>
      )}
      
      <div className="pt-4">
        <Button onClick={onViewHistory} variant="secondary" fullWidth>
            Histórico de Concluídos
        </Button>
      </div>
    </div>
  </div>
);

const FormView = ({
    customer,
    setCustomer,
    onBack,
    onNext
}: {
    customer: CustomerInfo,
    setCustomer: (c: CustomerInfo) => void,
    onBack: () => void,
    onNext: () => void
}) => (
    <div className="max-w-md mx-auto pt-8 px-4 pb-20">
       <div className="glass-card p-6 rounded-2xl">
           <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white">&larr; Cardápio</button>
                <h2 className="text-xl text-[#D6BB56] font-bold">Identificação</h2>
                <div className="w-8"></div>
           </div>
           
           <div className="grid grid-cols-3 gap-2 mb-6">
                {ORDER_TYPES.map(type => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => setCustomer({ ...customer, orderType: type.value })}
                        className={`py-3 px-1 rounded-xl font-bold text-xs transition-all border ${
                            customer.orderType === type.value
                            ? 'bg-[#D6BB56] text-[#292927] border-[#D6BB56]'
                            : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
           </div>

           <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
              <div className="flex gap-2">
                <div className="flex-1">
                    <Input 
                        label="Nome do Cliente *" 
                        value={customer.name} 
                        onChange={e => setCustomer({...customer, name: e.target.value})}
                        placeholder="Nome"
                    />
                </div>
                {customer.orderType === OrderType.TABLE && (
                     <div className="w-24">
                        <Input 
                            label="Mesa *" 
                            value={customer.tableNumber} 
                            onChange={e => setCustomer({...customer, tableNumber: e.target.value})}
                            placeholder="Nº"
                            type="number"
                        />
                    </div>
                )}
              </div>

              <Input 
                label="Telefone/WhatsApp" 
                value={customer.phone} 
                onChange={e => setCustomer({...customer, phone: e.target.value})}
                type="tel"
                placeholder="(00) 00000-0000"
              />

              {customer.orderType === OrderType.DELIVERY && (
                  <>
                    <div className="flex gap-2">
                        <div className="flex-[3]">
                             <Input label="Endereço *" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} placeholder="Rua..." />
                        </div>
                        <div className="flex-1">
                             <Input label="Nº *" value={customer.addressNumber} onChange={e => setCustomer({...customer, addressNumber: e.target.value})} placeholder="123" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-[2]">
                             <Input label="Ponto de Referência" value={customer.reference} onChange={e => setCustomer({...customer, reference: e.target.value})} placeholder="Próximo a..." />
                        </div>
                        <div className="flex-1">
                             <Input label="Taxa" type="number" step="0.50" value={customer.deliveryFee || ''} onChange={e => setCustomer({...customer, deliveryFee: parseFloat(e.target.value)})} placeholder="0.00" />
                        </div>
                    </div>
                  </>
              )}

              <Select 
                label="Forma de Pagamento"
                options={PAYMENT_METHODS}
                value={customer.paymentMethod}
                onChange={e => setCustomer({...customer, paymentMethod: e.target.value as PaymentMethod})}
              />

              <div className="mb-4">
                  <label className="block text-[#D6BB56] text-sm font-bold mb-2 ml-1">Observação do Pedido</label>
                  <textarea
                    className="appearance-none border border-white/10 rounded-xl w-full py-3 px-4 bg-black/20 text-white leading-tight focus:outline-none focus:border-[#D6BB56] transition-all backdrop-blur-sm"
                    rows={2}
                    value={customer.observation || ''}
                    onChange={e => setCustomer({...customer, observation: e.target.value})}
                  />
              </div>

              <div className="mb-6 flex items-center gap-3">
                  <input
                    id="paid-stamp"
                    type="checkbox"
                    className="w-5 h-5 accent-[#D6BB56]"
                    checked={customer.usePaidStamp || false}
                    onChange={e => setCustomer({...customer, usePaidStamp: e.target.checked})}
                  />
                  <label htmlFor="paid-stamp" className="text-gray-300 font-bold text-sm cursor-pointer">Usar Carimbo de Pago</label>
              </div>
              
              <Button type="submit" fullWidth>Ver Resumo do Pedido &rarr;</Button>
           </form>
       </div>
    </div>
);

// --- MANUAL ITEM MODAL ---
const ManualItemModal = ({
    isOpen,
    onClose,
    onConfirm
}: {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (item: CartItem) => void
}) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => { if (isOpen) { setName(''); setPrice(''); } }, [isOpen]);
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!name || !price) return;
        onConfirm({ id: 'manual-' + Date.now(), cartId: 'manual-' + Date.now(), name: name, price: parseFloat(price), categoryId: 'manual', quantity: 1 });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="glass-card w-full max-w-sm rounded-2xl p-6">
                <h3 className="text-xl font-bold text-[#D6BB56] mb-6">Item Manual</h3>
                <Input label="Nome do Item" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Item especial" autoFocus />
                <Input label="Valor (R$)" type="number" step="0.50" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleConfirm} className="flex-1">Adicionar</Button>
                </div>
            </div>
        </div>
    );
};

// --- PRODUCT MODAL ---
const ProductModal = ({
    product,
    isOpen,
    onClose,
    onConfirm
}: {
    product: Product | null,
    isOpen: boolean,
    onClose: () => void,
    onConfirm: (item: CartItem) => void
}) => {
    const [removed, setRemoved] = useState<string[]>([]);
    const [additions, setAdditions] = useState<string[]>([]);
    const [obs, setObs] = useState('');
    const [sides, setSides] = useState<string[]>([]);
    const [acaiPkg, setAcaiPkg] = useState('Mesa');
    const [acaiFExtras, setAcaiFExtras] = useState<string[]>([]);
    const [acaiPExtras, setAcaiPExtras] = useState<string[]>([]);

    useEffect(() => {
        setRemoved([]); setAdditions([]); setObs(''); setSides([]); setAcaiPkg('Mesa'); setAcaiFExtras([]); setAcaiPExtras([]);
    }, [product]);

    if (!isOpen || !product) return null;

    const isLanche = product.categoryId === 'lanches';
    const isFranguinho = product.categoryId === 'franguinho';
    const isAcai = product.categoryId === 'acai';
    const isBebida = product.categoryId === 'bebidas';
    const needsFlavor = isBebida && (product.name.toLowerCase().includes('suco') || product.name.toLowerCase().includes('uai'));

    const toggle = (list: string[], set: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        set(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    const extraPrice = isLanche ? additions.reduce((acc, curr) => acc + (EXTRAS_OPTIONS.find(e => e.name === curr)?.price || 0), 0)
                      : isAcai ? acaiPExtras.reduce((acc, curr) => acc + (ACAI_PAID_EXTRAS.find(e => e.name === curr)?.price || 0), 0)
                      : 0;

    const handleConfirm = () => {
        let finalAdd = isLanche ? [...additions] : isFranguinho ? [...sides] : isAcai ? [...acaiFExtras, ...acaiPExtras] : [];
        onConfirm({
            ...product, price: product.price + extraPrice, cartId: Date.now().toString(), quantity: 1,
            removedIngredients: removed, additions: finalAdd, packaging: isAcai ? acaiPkg : undefined, observation: obs
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md rounded-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#D6BB56]">{product.name}</h3>
                    <button onClick={onClose} className="text-gray-400 text-2xl">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-6">
                    {needsFlavor && <Input label="Sabor?" value={obs} onChange={e => setObs(e.target.value)} autoFocus />}
                    {isLanche && (
                        <div className="space-y-4">
                            {product.ingredients?.length && (
                                <div className="grid grid-cols-2 gap-2">
                                    {product.ingredients.map(ing => (
                                        <label key={ing} className={`flex items-center p-3 rounded-lg border cursor-pointer ${!removed.includes(ing) ? 'bg-[#D6BB56]/20 border-[#D6BB56]' : 'border-white/10 opacity-50'}`}>
                                            <input type="checkbox" className="hidden" checked={!removed.includes(ing)} onChange={() => toggle(removed, setRemoved, ing)} />
                                            <span className="text-sm font-bold">{ing}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Adicionais</h4>
                                {EXTRAS_OPTIONS.map(opt => (
                                    <label key={opt.name} className={`flex justify-between items-center p-3 rounded-lg border ${additions.includes(opt.name) ? 'bg-green-500/20 border-green-500' : 'border-white/10'}`}>
                                        <input type="checkbox" className="hidden" checked={additions.includes(opt.name)} onChange={() => toggle(additions, setAdditions, opt.name)} />
                                        <span className="text-sm">{opt.name}</span>
                                        <span className="text-[#D6BB56] font-bold">+R$ {opt.price.toFixed(2)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    {isFranguinho && (
                        <div className="grid grid-cols-1 gap-2">
                            {FRANGUINHO_SIDES.map(side => (
                                <label key={side} className={`flex justify-between items-center p-3 rounded-lg border ${sides.includes(side) ? 'bg-[#D6BB56]/20 border-[#D6BB56]' : 'border-white/10'}`}>
                                    <input type="checkbox" className="hidden" disabled={!sides.includes(side) && sides.length >= (product.maxSides || 0)} onChange={() => toggle(sides, setSides, side)} />
                                    <span className="text-sm">{side}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    {isAcai && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {ACAI_PACKAGING.map(p => (
                                    <button key={p} onClick={() => setAcaiPkg(p)} className={`flex-1 py-2 rounded border text-xs font-bold ${acaiPkg === p ? 'bg-[#D6BB56] text-black border-[#D6BB56]' : 'border-white/10'}`}>{p}</button>
                                ))}
                            </div>
                            {/* Simplified Açaí List */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Adicionais Pagos</h4>
                                {ACAI_PAID_EXTRAS.map(opt => (
                                    <label key={opt.name} className={`flex justify-between items-center p-2 rounded border ${acaiPExtras.includes(opt.name) ? 'bg-[#D6BB56]/20 border-[#D6BB56]' : 'border-white/10'}`}>
                                        <input type="checkbox" className="hidden" checked={acaiPExtras.includes(opt.name)} onChange={() => toggle(acaiPExtras, setAcaiPExtras, opt.name)} />
                                        <span className="text-xs">{opt.name}</span>
                                        <span className="text-xs text-[#D6BB56] font-bold">+R$ {opt.price.toFixed(2)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-white/10">
                    <Button onClick={handleConfirm} fullWidth>ADICIONAR - R$ {(product.price + extraPrice).toFixed(2)}</Button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

export default function App() {
  const [view, setView] = useState<'HOME' | 'HISTORY' | 'ORDER'>('HOME');
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const d = localStorage.getItem('drafts');
    const h = localStorage.getItem('orders');
    if (d) setDrafts(JSON.parse(d));
    if (h) setOrders(JSON.parse(h));
  }, []);

  useEffect(() => localStorage.setItem('drafts', JSON.stringify(drafts)), [drafts]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);

  // Printing
  useEffect(() => {
    if (receiptOrder) {
      const timer = setTimeout(() => { window.print(); setReceiptOrder(null); }, 100);
      return () => clearTimeout(timer);
    }
  }, [receiptOrder]);

  const activeDraft = drafts.find(d => d.id === activeDraftId);

  const updateDraft = (id: string, updates: Partial<OrderDraft>) => {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d));
  };

  const handleStartOrder = () => {
    const id = Date.now().toString();
    const newDraft: OrderDraft = {
        id, cart: [], step: 'MENU', updatedAt: Date.now(),
        customer: { name: '', phone: '', address: '', addressNumber: '', reference: '', deliveryFee: 0, tableNumber: '', orderType: OrderType.COUNTER, paymentMethod: PaymentMethod.PIX }
    };
    setDrafts(prev => [...prev, newDraft]);
    setActiveDraftId(id);
    setView('ORDER');
  };

  const deleteDraft = (id: string) => {
    if (confirm("Deseja realmente excluir este rascunho?")) {
        setDrafts(prev => prev.filter(d => d.id !== id));
    }
  };

  const finishOrder = () => {
    if (!activeDraft) return;
    const cartTotal = activeDraft.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const finalTotal = cartTotal + (activeDraft.customer.orderType === OrderType.DELIVERY ? (activeDraft.customer.deliveryFee || 0) : 0);
    
    const newOrder: Order = {
        id: activeDraft.id,
        customer: activeDraft.customer,
        items: activeDraft.cart,
        total: finalTotal,
        createdAt: new Date().toISOString(),
        status: OrderStatus.PENDING
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setDrafts(prev => prev.filter(d => d.id !== activeDraft.id));
    setReceiptOrder(newOrder);
    setActiveDraftId(null);
    setView('HOME');
  };

  return (
    <div className="min-h-screen text-[#EFF0F3] font-sans selection:bg-[#D6BB56] selection:text-[#292927]">
      <div className="printable-area hidden bg-white text-black"><Receipt order={receiptOrder} /></div>

      <div className="no-print h-full">
        {view === 'HOME' && (
            <HomeView 
                onStartOrder={handleStartOrder}
                onViewHistory={() => setView('HISTORY')}
                drafts={drafts}
                onSelectDraft={id => { setActiveDraftId(id); setView('ORDER'); }}
                onDeleteDraft={deleteDraft}
            />
        )}

        {view === 'HISTORY' && (
            <div className="h-screen flex flex-col">
                <div className="p-4 glass flex justify-between items-center border-b border-white/5 sticky top-0 z-10">
                    <button onClick={() => setView('HOME')} className="text-[#D6BB56] font-bold">&larr; Voltar</button>
                    <h2 className="text-xl font-bold text-white">Histórico</h2>
                    <div className="w-10"></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-4">
                    {orders.length === 0 ? <div className="glass-card p-8 rounded-xl text-center text-gray-500">Sem histórico.</div>
                    : orders.map(order => (
                        <div key={order.id} className="glass-card rounded-xl p-4 border-l-4 border-[#D6BB56] flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-white">{order.customer.name}</h3>
                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                                <p className="font-bold text-[#D6BB56] text-sm">R$ {order.total.toFixed(2)}</p>
                            </div>
                            <button onClick={() => setReceiptOrder(order)} className="bg-[#D6BB56] text-black p-2 rounded-lg font-bold">🖨️</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {view === 'ORDER' && activeDraft && (
            <div className="h-screen flex flex-col">
                {activeDraft.step === 'MENU' && (
                    <>
                        <div className="p-4 glass border-b border-white/5 sticky top-0 z-10 flex justify-between items-center">
                            <button onClick={() => { setView('HOME'); setActiveDraftId(null); }} className="text-[#D6BB56] font-bold">&larr; Sair e Salvar</button>
                            <h2 className="text-xl font-bold text-white">Cardápio</h2>
                            <div className="w-10"></div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
                            <div className="grid grid-cols-1 gap-4">
                                <Button variant="secondary" onClick={() => setIsManualModalOpen(true)} fullWidth className="border-dashed py-4">➕ ITEM MANUAL / PERSONALIZADO</Button>
                                {CATEGORIES.map(cat => (
                                    <div key={cat.id} className="space-y-3">
                                        <h3 className="text-[#D6BB56] font-bold text-sm uppercase tracking-widest pl-2">{cat.icon} {cat.name}</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {PRODUCTS.filter(p => p.categoryId === cat.id).map(p => (
                                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="glass-card p-4 rounded-xl flex justify-between items-center hover:bg-white/5 cursor-pointer">
                                                    <div><p className="font-bold text-white">{p.name}</p><p className="text-[#D6BB56] font-bold text-sm">R$ {p.price.toFixed(2)}</p></div>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#D6BB56] border border-[#D6BB56]/30">+</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {activeDraft.cart.length > 0 && (
                            <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t border-[#D6BB56]/30 backdrop-blur-xl">
                                <div className="max-w-md mx-auto flex justify-between items-center">
                                    <div><p className="text-xs text-gray-400">Total Itens</p><p className="text-xl font-bold text-[#D6BB56]">R$ {activeDraft.cart.reduce((s,i) => s + (i.price * i.quantity), 0).toFixed(2)}</p></div>
                                    <Button onClick={() => updateDraft(activeDraft.id, { step: 'FORM' })}>Identificar Cliente &rarr;</Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeDraft.step === 'FORM' && (
                    <FormView 
                        customer={activeDraft.customer}
                        setCustomer={c => updateDraft(activeDraft.id, { customer: c })}
                        onBack={() => updateDraft(activeDraft.id, { step: 'MENU' })}
                        onNext={() => updateDraft(activeDraft.id, { step: 'SUMMARY' })}
                    />
                )}

                {activeDraft.step === 'SUMMARY' && (
                    <div className="flex flex-col h-screen">
                        <div className="p-4 glass flex justify-between items-center border-b border-white/5">
                            <button onClick={() => updateDraft(activeDraft.id, { step: 'FORM' })} className="text-[#D6BB56] font-bold">&larr; Voltar</button>
                            <h2 className="text-xl font-bold text-white">Resumo Final</h2>
                            <div className="w-10"></div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="glass-card p-4 rounded-xl">
                                <p className="font-bold text-[#D6BB56] uppercase text-xs mb-2">{activeDraft.customer.orderType}</p>
                                <p className="text-xl font-bold text-white">{activeDraft.customer.name}</p>
                                <p className="text-gray-400">{activeDraft.customer.phone}</p>
                                <p className="text-sm mt-2">{activeDraft.customer.paymentMethod}</p>
                            </div>
                            <div className="glass-card p-4 rounded-xl space-y-3">
                                {activeDraft.cart.map(item => (
                                    <div key={item.cartId} className="flex justify-between items-start border-b border-white/5 pb-2">
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{item.quantity}x {item.name}</p>
                                            <p className="text-xs text-gray-400">R$ {item.price.toFixed(2)} cada</p>
                                        </div>
                                        <p className="font-bold text-white">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                        <button onClick={() => updateDraft(activeDraft.id, { cart: activeDraft.cart.filter(i => i.cartId !== item.cartId) })} className="ml-3 text-red-400">&times;</button>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <div className="flex justify-between text-white font-bold"><p>Total Pedido</p><p>R$ {activeDraft.cart.reduce((s,i) => s + (i.price * i.quantity), 0).toFixed(2)}</p></div>
                                    {activeDraft.customer.orderType === OrderType.DELIVERY && <div className="flex justify-between text-yellow-500 text-sm"><p>Taxa de Entrega</p><p>R$ {(activeDraft.customer.deliveryFee || 0).toFixed(2)}</p></div>}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 glass border-t border-white/5"><Button onClick={finishOrder} fullWidth className="py-5 text-xl">FINALIZAR E IMPRIMIR ✅</Button></div>
                    </div>
                )}
            </div>
        )}

        <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onConfirm={item => { if (activeDraftId) updateDraft(activeDraftId, { cart: [...(activeDraft?.cart || []), item] }); setSelectedProduct(null); }} />
        <ManualItemModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} onConfirm={item => { if (activeDraftId) updateDraft(activeDraftId, { cart: [...(activeDraft?.cart || []), item] }); setIsManualModalOpen(false); }} />
      </div>
    </div>
  );
}
