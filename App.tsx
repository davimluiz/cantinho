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

// --- RECEIPT COMPONENT FOR BROWSER PRINTING ---
const Receipt = ({ order }: { order: Order | null }) => {
    if (!order) return null;

    const date = new Date(order.createdAt).toLocaleString('pt-BR');
    
    // Style helper for dashed lines
    const DashedLine = () => (
        <div className="w-full border-b border-black border-dashed my-2" style={{ borderBottomStyle: 'dashed' }}></div>
    );

    // Calculate subtotal (items only) to show clear breakdown
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
                                        {item.packaging && (
                                            <div className="text-[10px] uppercase font-normal text-black/70">
                                                [{item.packaging}]
                                            </div>
                                        )}
                                        {item.observation && (
                                            <div className="text-[10px] uppercase font-normal text-black/70">
                                                * {item.observation}
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-right">{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                                {/* Customizations Row */}
                                {(item.removedIngredients?.length > 0 || item.additions?.length > 0) && (
                                    <tr>
                                        <td></td>
                                        <td colSpan={2} className="text-xs pb-1">
                                            {item.removedIngredients?.map(ing => (
                                                <div key={`rem-${ing}`}>- SEM {ing.toUpperCase()}</div>
                                            ))}
                                            {item.additions?.map(add => (
                                                <div key={`add-${add}`}>+ COM {add.toUpperCase()}</div>
                                            ))}
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
                <div className="text-center mt-4 border border-black p-2 font-bold uppercase text-lg">
                    CARIMBO DE PAGO
                </div>
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
}: { 
  onStartOrder: () => void, 
  onViewHistory: () => void, 
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
           <h2 className="text-2xl text-[#D6BB56] font-bold mb-6 text-center">Dados do Pedido</h2>
           
           {/* TYPE FLAGS */}
           <div className="grid grid-cols-3 gap-2 mb-6">
                {ORDER_TYPES.map(type => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => setCustomer(prev => ({ ...prev, orderType: type.value }))}
                        className={`py-3 px-1 rounded-xl font-bold text-sm transition-all border ${
                            customer.orderType === type.value
                            ? 'bg-[#D6BB56] text-[#292927] border-[#D6BB56]'
                            : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
           </div>

           <form onSubmit={onSubmit}>
              <div className="flex gap-2">
                <div className="flex-1">
                    <Input 
                        label="Nome do Cliente *" 
                        value={customer.name} 
                        onChange={e => setCustomer(prev => ({...prev, name: e.target.value}))}
                        placeholder="Nome"
                    />
                </div>
                {customer.orderType === OrderType.TABLE && (
                     <div className="w-24">
                        <Input 
                            label="Mesa *" 
                            value={customer.tableNumber} 
                            onChange={e => setCustomer(prev => ({...prev, tableNumber: e.target.value}))}
                            placeholder="Nº"
                            type="number"
                        />
                    </div>
                )}
              </div>

              <Input 
                label="Telefone/WhatsApp *" 
                value={customer.phone} 
                onChange={e => setCustomer(prev => ({...prev, phone: e.target.value}))}
                type="tel"
                placeholder="(00) 00000-0000"
              />

              {customer.orderType === OrderType.DELIVERY && (
                  <>
                    <div className="flex gap-2">
                        <div className="flex-[3]">
                             <Input 
                                label="Endereço (Rua/Bairro) *" 
                                value={customer.address} 
                                onChange={e => setCustomer(prev => ({...prev, address: e.target.value}))}
                                placeholder="Rua..."
                            />
                        </div>
                        <div className="flex-1">
                             <Input 
                                label="Nº *" 
                                value={customer.addressNumber} 
                                onChange={e => setCustomer(prev => ({...prev, addressNumber: e.target.value}))}
                                placeholder="123"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-[2]">
                             <Input 
                                label="Ponto de Referência" 
                                value={customer.reference} 
                                onChange={e => setCustomer(prev => ({...prev, reference: e.target.value}))}
                                placeholder="Ex: Próximo ao mercado"
                            />
                        </div>
                        <div className="flex-1">
                             <Input 
                                label="Taxa (R$)" 
                                type="number"
                                step="0.50"
                                value={customer.deliveryFee || ''} 
                                onChange={e => setCustomer(prev => ({...prev, deliveryFee: parseFloat(e.target.value)}))}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                  </>
              )}

              <Select 
                label="Forma de Pagamento"
                options={PAYMENT_METHODS}
                value={customer.paymentMethod}
                onChange={e => setCustomer(prev => ({...prev, paymentMethod: e.target.value as PaymentMethod}))}
              />

              <div className="mb-4">
                  <label className="block text-[#D6BB56] text-sm font-bold mb-2 ml-1">
                      Observação do Pedido
                  </label>
                  <textarea
                    className="appearance-none border border-white/10 rounded-xl w-full py-3 px-4 bg-black/20 text-white leading-tight focus:outline-none focus:border-[#D6BB56] focus:ring-1 focus:ring-[#D6BB56] transition-all backdrop-blur-sm placeholder-gray-500"
                    rows={2}
                    placeholder="Algo especial?"
                    value={customer.observation || ''}
                    onChange={e => setCustomer(prev => ({...prev, observation: e.target.value}))}
                  />
              </div>

              <div className="mb-6 flex items-center gap-3">
                  <input
                    id="paid-stamp"
                    type="checkbox"
                    className="w-5 h-5 accent-[#D6BB56]"
                    checked={customer.usePaidStamp || false}
                    onChange={e => setCustomer(prev => ({...prev, usePaidStamp: e.target.checked}))}
                  />
                  <label htmlFor="paid-stamp" className="text-gray-300 font-bold text-sm cursor-pointer">
                      Usar Carimbo de Pago
                  </label>
              </div>
              
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

    useEffect(() => {
        if (isOpen) {
            setName('');
            setPrice('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!name || !price) {
            alert("Preencha nome e valor.");
            return;
        }
        onConfirm({
            id: 'manual-' + Date.now(),
            cartId: 'manual-' + Date.now(),
            name: name,
            price: parseFloat(price),
            categoryId: 'manual',
            quantity: 1,
        });
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

// --- PRODUCT CUSTOMIZATION MODAL ---
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
    // Shared State
    const [removed, setRemoved] = useState<string[]>([]);
    const [additions, setAdditions] = useState<string[]>([]);
    const [itemObservation, setItemObservation] = useState<string>('');
    
    // Franguinho State
    const [selectedSides, setSelectedSides] = useState<string[]>([]);

    // Açaí State
    const [acaiPackaging, setAcaiPackaging] = useState<string>('Mesa');
    const [acaiFreeExtras, setAcaiFreeExtras] = useState<string[]>([]);
    const [acaiPaidExtras, setAcaiPaidExtras] = useState<string[]>([]);

    useEffect(() => {
        setRemoved([]);
        setAdditions([]);
        setItemObservation('');
        setSelectedSides([]);
        
        // Reset Açaí
        setAcaiPackaging('Mesa');
        setAcaiFreeExtras([]);
        setAcaiPaidExtras([]);
    }, [product]);

    if (!isOpen || !product) return null;

    // --- LOGIC HANDLERS ---
    
    // Standard/Lanche
    const toggleIngredient = (ing: string) => {
        setRemoved(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
    };
    const toggleAddition = (add: string) => {
        setAdditions(prev => prev.includes(add) ? prev.filter(a => a !== add) : [...prev, add]);
    };

    // Franguinho
    const toggleSide = (side: string) => {
        if (selectedSides.includes(side)) {
            setSelectedSides(prev => prev.filter(s => s !== side));
        } else {
            if (selectedSides.length < (product.maxSides || 0)) {
                setSelectedSides(prev => [...prev, side]);
            }
        }
    };

    // Açaí
    const toggleAcaiFree = (item: string) => {
        setAcaiFreeExtras(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };
    const toggleAcaiPaid = (item: string) => {
        setAcaiPaidExtras(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    // --- CALCULATIONS ---

    const isLanche = product.categoryId === 'lanches';
    const isFranguinho = product.categoryId === 'franguinho';
    const isAcai = product.categoryId === 'acai';
    const isBebida = product.categoryId === 'bebidas';
    
    // Determine if flavor field is needed
    const needsFlavor = isBebida && (product.name.toLowerCase().includes('suco') || product.name.toLowerCase().includes('uai'));

    let extraPrice = 0;
    if (isLanche) {
        extraPrice = additions.reduce((acc, curr) => {
            const opt = EXTRAS_OPTIONS.find(e => e.name === curr);
            return acc + (opt?.price || 0);
        }, 0);
    } else if (isAcai) {
        extraPrice = acaiPaidExtras.reduce((acc, curr) => {
            const opt = ACAI_PAID_EXTRAS.find(e => e.name === curr);
            return acc + (opt?.price || 0);
        }, 0);
    }
    
    const totalPrice = product.price + extraPrice;

    const handleConfirm = () => {
        let finalAdditions: string[] = [];
        let finalPackaging: string | undefined = undefined;

        if (isLanche) {
            finalAdditions = [...additions];
        } else if (isFranguinho) {
            finalAdditions = [...selectedSides];
        } else if (isAcai) {
            finalPackaging = acaiPackaging;
            finalAdditions = [...acaiFreeExtras, ...acaiPaidExtras];
        }

        onConfirm({
            ...product,
            price: totalPrice,
            cartId: Date.now().toString(),
            quantity: 1,
            removedIngredients: removed,
            additions: finalAdditions,
            packaging: finalPackaging,
            observation: itemObservation,
            name: product.name 
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-md rounded-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[#D6BB56]">{product.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    <p className="text-white text-lg font-bold mb-4">R$ {product.price.toFixed(2)}</p>
                    
                    {/* --- BEBIDAS FLAVOR --- */}
                    {needsFlavor && (
                        <div className="mb-4">
                            <Input
                                label="Qual sabor?"
                                value={itemObservation}
                                onChange={e => setItemObservation(e.target.value)}
                                placeholder="Digite o sabor aqui..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* --- LANCHES SECTION --- */}
                    {isLanche && (
                        <>
                             {product.ingredients && product.ingredients.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredientes (Desmarque para retirar)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {product.ingredients.map(ing => {
                                            const isRemoved = removed.includes(ing);
                                            return (
                                                <label key={ing} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${!isRemoved ? 'bg-[#D6BB56]/20 border-[#D6BB56]' : 'bg-transparent border-white/10 opacity-50'}`}>
                                                    <input type="checkbox" className="hidden" checked={!isRemoved} onChange={() => toggleIngredient(ing)} />
                                                    <span className={`text-sm font-bold ${!isRemoved ? 'text-white' : 'text-gray-400 line-through'}`}>{ing}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Adicionais</h4>
                                <div className="space-y-2">
                                    {EXTRAS_OPTIONS.map(opt => {
                                        const isAdded = additions.includes(opt.name);
                                        return (
                                            <label key={opt.name} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isAdded ? 'bg-green-500/20 border-green-500' : 'bg-transparent border-white/10 hover:bg-white/5'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isAdded ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                                        {isAdded && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className="text-sm text-white">{opt.name}</span>
                                                </div>
                                                <span className="text-[#D6BB56] font-bold">+ R$ {opt.price.toFixed(2)}</span>
                                                <input type="checkbox" className="hidden" checked={isAdded} onChange={() => toggleAddition(opt.name)} />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- FRANGUINHO SECTION --- */}
                    {isFranguinho && product.maxSides && (
                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Acompanhamentos ({selectedSides.length}/{product.maxSides})
                            </h4>
                            <div className="space-y-2">
                                {FRANGUINHO_SIDES.map(side => {
                                    const isSelected = selectedSides.includes(side);
                                    const isDisabled = !isSelected && selectedSides.length >= (product.maxSides || 0);

                                    return (
                                        <label key={side} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected ? 'bg-[#D6BB56]/20 border-[#D6BB56] cursor-pointer' : isDisabled ? 'bg-transparent border-white/5 opacity-50 cursor-not-allowed' : 'bg-transparent border-white/10 hover:bg-white/5 cursor-pointer'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-[#D6BB56] border-[#D6BB56]' : 'border-gray-500'}`}>
                                                    {isSelected && <span className="text-black text-xs font-bold">✓</span>}
                                                </div>
                                                <span className="text-sm text-white">{side}</span>
                                            </div>
                                            <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleSide(side)} disabled={isDisabled} />
                                        </label>
                                    );
                                })}
                            </div>
                            {selectedSides.length < (product.maxSides || 0) && (
                                <p className="text-xs text-yellow-500 mt-2">* Selecione mais {product.maxSides! - selectedSides.length} item(s)</p>
                            )}
                        </div>
                    )}

                    {/* --- AÇAÍ SECTION --- */}
                    {isAcai && (
                        <div className="space-y-6">
                            {/* Embalagem */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Embalagem</h4>
                                <div className="flex flex-wrap gap-2">
                                    {ACAI_PACKAGING.map(pkg => (
                                        <button
                                            key={pkg}
                                            onClick={() => setAcaiPackaging(pkg)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${acaiPackaging === pkg ? 'bg-[#D6BB56] text-black border-[#D6BB56]' : 'bg-transparent text-gray-300 border-white/20 hover:bg-white/10'}`}
                                        >
                                            {pkg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Complementos (Grátis) */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Complementos</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {ACAI_COMPLEMENTS.map(item => {
                                        const isSelected = acaiFreeExtras.includes(item);
                                        return (
                                            <label key={item} className={`flex items-center p-2 rounded border cursor-pointer ${isSelected ? 'bg-[#D6BB56]/20 border-[#D6BB56]' : 'border-white/10'}`}>
                                                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleAcaiFree(item)} />
                                                <div className={`w-4 h-4 rounded-sm border mr-2 flex items-center justify-center ${isSelected ? 'bg-[#D6BB56] border-[#D6BB56]' : 'border-gray-500'}`}>
                                                    {isSelected && <span className="text-black text-[10px]">✓</span>}
                                                </div>
                                                <span className="text-xs text-white">{item}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Coberturas (Grátis) */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Coberturas</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {ACAI_TOPPINGS.map(item => {
                                        const isSelected = acaiFreeExtras.includes(item);
                                        return (
                                            <label key={item} className={`flex items-center p-2 rounded border cursor-pointer ${isSelected ? 'bg-[#D6BB56]/20 border-[#D6BB56]' : 'border-white/10'}`}>
                                                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleAcaiFree(item)} />
                                                <div className={`w-4 h-4 rounded-sm border mr-2 flex items-center justify-center ${isSelected ? 'bg-[#D6BB56] border-[#D6BB56]' : 'border-gray-500'}`}>
                                                    {isSelected && <span className="text-black text-[10px]">✓</span>}
                                                </div>
                                                <span className="text-xs text-white">{item}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                             {/* Frutas (Grátis) */}
                             <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Frutas</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {ACAI_FRUITS.map(item => {
                                        const isSelected = acaiFreeExtras.includes(item);
                                        return (
                                            <label key={item} className={`flex items-center p-2 rounded border cursor-pointer ${isSelected ? 'bg-[#D6BB56]/20 border-[#D6BB56]' : 'border-white/10'}`}>
                                                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleAcaiFree(item)} />
                                                <div className={`w-4 h-4 rounded-sm border mr-2 flex items-center justify-center ${isSelected ? 'bg-[#D6BB56] border-[#D6BB56]' : 'border-gray-500'}`}>
                                                    {isSelected && <span className="text-black text-[10px]">✓</span>}
                                                </div>
                                                <span className="text-xs text-white">{item}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Adicionais Pagos */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Adicionais (+ $$)</h4>
                                <div className="space-y-2">
                                    {ACAI_PAID_EXTRAS.map(opt => {
                                        const isSelected = acaiPaidExtras.includes(opt.name);
                                        return (
                                            <label key={opt.name} className={`flex items-center justify-between p-2 rounded border cursor-pointer ${isSelected ? 'bg-green-500/20 border-green-500' : 'border-white/10'}`}>
                                                 <div className="flex items-center">
                                                    <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleAcaiPaid(opt.name)} />
                                                    <div className={`w-4 h-4 rounded-sm border mr-2 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                                        {isSelected && <span className="text-white text-[10px]">✓</span>}
                                                    </div>
                                                    <span className="text-xs text-white">{opt.name}</span>
                                                </div>
                                                <span className="text-[#D6BB56] text-xs font-bold">+ R$ {opt.price.toFixed(2)}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <Button 
                        onClick={handleConfirm} 
                        fullWidth
                        disabled={isFranguinho && selectedSides.length < (product.maxSides || 0)}
                        className={isFranguinho && selectedSides.length < (product.maxSides || 0) ? 'opacity-50' : ''}
                    >
                        ADICIONAR - R$ {totalPrice.toFixed(2)}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MenuView = ({
    selectedCategory,
    setSelectedCategory,
    categories,
    products,
    cart,
    addToCart,
    cartTotal,
    onViewSummary,
    onBack,
    onSelectProduct,
    onManualItem
}: {
    selectedCategory: string | null,
    setSelectedCategory: (id: string | null) => void,
    categories: Category[],
    products: Product[],
    cart: CartItem[],
    addToCart: (p: Product) => void,
    cartTotal: number,
    onViewSummary: () => void,
    onBack: () => void,
    onSelectProduct: (p: Product) => void,
    onManualItem: () => void
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
        // If searching, ignore category selection, otherwise respect it
        return searchTerm ? matchesSearch : matchesCategory;
    });

    // If category selected OR searching
    if (selectedCategory || searchTerm) {
        const categoryName = selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Busca';

        return (
            <div className="flex flex-col h-screen">
                <div className="p-4 glass border-b border-white/5 sticky top-0 z-10 space-y-3">
                    <div className="flex items-center justify-between">
                        <button onClick={() => { setSelectedCategory(null); setSearchTerm(''); }} className="text-[#D6BB56] font-bold">
                            &larr; Voltar
                        </button>
                        <h2 className="text-xl font-bold text-white shadow-black drop-shadow-md">{searchTerm ? 'Resultados' : categoryName}</h2>
                        <div className="w-10"></div>
                    </div>
                    {/* Search Bar inside List View */}
                    <input 
                        type="search"
                        placeholder="🔍 Buscar lanche, bebida..."
                        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D6BB56] transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus={!!searchTerm}
                    />
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 pb-32">
                    <div className="grid grid-cols-1 gap-4">
                        {/* MANUAL ITEM BUTTON */}
                        <div 
                            onClick={onManualItem}
                            className="glass-card p-4 rounded-xl flex justify-between items-center border-dashed border-2 border-[#D6BB56]/50 bg-[#D6BB56]/5 hover:bg-[#D6BB56]/10 cursor-pointer transition-all active:scale-95"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-[#D6BB56]">ITEM MANUAL / PERSONALIZADO</h3>
                                <p className="text-gray-400 text-sm">Digite nome e valor na hora</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#D6BB56] flex items-center justify-center text-black font-bold">
                                ➕
                            </div>
                        </div>

                        {filteredProducts.map(product => {
                            // Count quantity of this base product in cart
                            const qtyInCart = cart.filter(i => i.id === product.id).reduce((acc, i) => acc + i.quantity, 0);
                            
                            return (
                                <div key={product.id} onClick={() => onSelectProduct(product)} className="glass-card p-4 rounded-xl flex justify-between items-center transition-all hover:bg-white/10 cursor-pointer active:scale-95">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-white">{product.name}</h3>
                                        <p className="text-[#D6BB56] font-bold">R$ {product.price.toFixed(2)}</p>
                                        {product.description && <p className="text-xs text-gray-400 mt-1">{product.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        {qtyInCart > 0 && (
                                            <span className="bg-[#D6BB56] text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">
                                                {qtyInCart}
                                            </span>
                                        )}
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#D6BB56] border border-[#D6BB56]/30">
                                            +
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <div className="text-center text-gray-400 mt-10">
                                Nenhum produto encontrado.
                            </div>
                        )}
                    </div>
                </div>
                
               {/* Cart Summary Bar */}
                {cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t border-[#D6BB56]/30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                        <div className="max-w-md mx-auto flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-300">Total ({cart.reduce((a,b) => a+b.quantity, 0)} itens)</p>
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
        <div className="max-w-md mx-auto pt-8 px-4 pb-32">
             <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white">&larr; Voltar</button>
                <h2 className="text-2xl text-[#D6BB56] font-bold">Cardápio</h2>
                <div className="w-10"></div>
             </div>

             <div className="mb-6 space-y-4">
                <input 
                    type="search"
                    placeholder="🔍 O que o cliente deseja hoje?"
                    className="w-full bg-glass border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-[#D6BB56] transition-colors shadow-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Button 
                    onClick={onManualItem}
                    fullWidth
                    variant="secondary"
                    className="border-dashed border-2 text-lg py-4"
                >
                   ➕ NOVO ITEM MANUAL
                </Button>
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

             {/* Bottom Summary Bar for Category view too */}
             {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t border-[#D6BB56]/30 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl z-20">
                    <div className="max-w-md mx-auto flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-300">Total ({cart.reduce((a,b) => a+b.quantity, 0)} itens)</p>
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
};

const SummaryView = ({
    customer,
    cart,
    cartTotal,
    removeFromCart,
    onBack,
    onFinish,
    onEditForm
}: {
    customer: CustomerInfo,
    cart: CartItem[],
    cartTotal: number,
    removeFromCart: (cartId: string) => void,
    onBack: () => void,
    onFinish: () => void,
    onEditForm: () => void
}) => {
    
    // Calculate final total including delivery fee
    const deliveryFee = customer.orderType === OrderType.DELIVERY ? (customer.deliveryFee || 0) : 0;
    const finalTotal = cartTotal + deliveryFee;

    return (
        <div className="flex flex-col h-screen">
            <div className="p-4 glass border-b border-white/5 sticky top-0 z-10 flex justify-between items-center">
                <button onClick={onBack} className="text-[#D6BB56] font-bold">&larr; Voltar</button>
                <h2 className="text-xl text-[#D6BB56] font-bold text-center">Resumo do Pedido</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="glass-card rounded-xl p-4 mb-4 relative">
                    <button 
                        onClick={onEditForm}
                        className="absolute top-4 right-4 text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded-full font-bold border border-white/10"
                    >
                        EDITAR DADOS
                    </button>
                    <div className="flex justify-between mb-2">
                        <span className="bg-[#D6BB56] text-[#292927] text-xs font-bold px-2 py-1 rounded uppercase">
                            {customer.orderType} {customer.tableNumber ? `#${customer.tableNumber}` : ''}
                        </span>
                        <span className="text-gray-400 text-xs">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="font-bold text-lg text-white">{customer.name}</p>
                    <p className="text-gray-300">{customer.phone}</p>
                    {customer.orderType === OrderType.DELIVERY && (
                        <p className="text-gray-400 text-sm mt-1 border-t border-white/5 pt-1 mt-1">
                            {customer.address}, {customer.addressNumber} <br/> 
                            <span className="italic">{customer.reference}</span>
                        </p>
                    )}
                    <p className="text-[#D6BB56] font-bold mt-2 text-sm pt-2 inline-block">
                        Pagamento: {customer.paymentMethod}
                    </p>
                    {customer.observation && (
                        <div className="mt-2 text-xs text-gray-400 italic">
                            Obs: {customer.observation}
                        </div>
                    )}
                    {customer.usePaidStamp && (
                        <div className="mt-2 text-xs font-bold text-green-400 border border-green-400/30 rounded px-2 py-1 inline-block">
                            COM CARIMBO DE PAGO
                        </div>
                    )}
                </div>

                <div className="glass-card rounded-xl p-4 mb-20">
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Itens do Pedido</h3>
                    {cart.map((item, idx) => (
                        <div key={item.cartId} className="flex flex-col mb-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-bold text-white">
                                        {item.name}
                                        {item.packaging && <span className="text-xs text-[#D6BB56] ml-2 font-normal">[{item.packaging}]</span>}
                                        {item.observation && <span className="text-xs text-[#D6BB56] ml-2 italic">(*{item.observation})</span>}
                                    </p>
                                    <p className="text-xs text-gray-400">R$ {item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold w-16 text-right text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-300 ml-2 px-2 transition-colors">&times;</button>
                                </div>
                            </div>
                            {/* Customizations display */}
                            {(item.removedIngredients?.length > 0 || item.additions?.length > 0) && (
                                <div className="mt-1 pl-2 text-xs text-gray-300 border-l-2 border-[#D6BB56]/30">
                                    {item.removedIngredients?.map(ing => (
                                        <span key={ing} className="block text-red-300/80">- Sem {ing}</span>
                                    ))}
                                    {item.additions?.map(add => (
                                        <span key={add} className="block text-green-300/80">+ Com {add}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <div className="mt-6 pt-4 border-t border-white/20">
                        <div className="flex justify-between items-center mb-1 text-gray-300 text-sm">
                            <span>Subtotal</span>
                            <span>R$ {cartTotal.toFixed(2)}</span>
                        </div>
                        {customer.orderType === OrderType.DELIVERY && (
                            <div className="flex justify-between items-center mb-1 text-white font-bold text-sm">
                                <span>Taxa de Entrega</span>
                                <span>R$ {deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                            <span className="text-xl font-bold text-white">TOTAL</span>
                            <span className="text-2xl font-bold text-[#D6BB56]">R$ {finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 glass border-t border-white/5">
                <div className="flex gap-4 max-w-md mx-auto">
                    <Button variant="secondary" onClick={onBack} className="flex-1">
                        Adicionar Itens
                    </Button>
                    <Button onClick={onFinish} className="flex-1 shadow-lg shadow-[#D6BB56]/20">
                        FINALIZAR
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

type View = 'HOME' | 'FORM' | 'MENU' | 'SUMMARY' | 'HISTORY';

export default function App() {
  const [view, setView] = useState<View>('HOME');
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Current Order State
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    address: '',
    addressNumber: '',
    reference: '',
    phone: '',
    paymentMethod: PaymentMethod.PIX,
    orderType: OrderType.COUNTER, // Default
    tableNumber: '',
    deliveryFee: 0,
    observation: '',
    usePaidStamp: false
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Selection Logic
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Printing State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

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
            setReceiptOrder(null);
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [receiptOrder]);

  const handleStartOrder = () => {
    setCustomer({
        name: '',
        address: '',
        addressNumber: '',
        reference: '',
        phone: '',
        paymentMethod: PaymentMethod.PIX,
        orderType: OrderType.COUNTER,
        tableNumber: '',
        deliveryFee: 0,
        observation: '',
        usePaidStamp: false
    });
    setCart([]);
    setView('FORM');
  };

  const handleEditOrder = (order: Order) => {
      setCustomer(order.customer);
      setCart(order.items);
      // Remove the old order from history to "re-finish" it as a modification
      // Or simply keep it and create a new one. User requested "edit".
      // Let's remove it to treat as an update flow.
      setOrders(prev => prev.filter(o => o.id !== order.id));
      setView('FORM');
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!customer.name) { alert("Nome é obrigatório."); return; }
    if (!customer.phone) { alert("Telefone é obrigatório."); return; }
    if (customer.orderType === OrderType.DELIVERY) {
        if (!customer.address) { alert("Endereço é obrigatório para entrega."); return; }
        if (!customer.addressNumber) { alert("Número da casa é obrigatório para entrega."); return; }
    }
    if (customer.orderType === OrderType.TABLE && !customer.tableNumber) { alert("Número da mesa é obrigatório."); return; }
    
    setView('MENU');
  };

  const addToCart = (product: Product) => {
    // Open modal instead of direct adding
    setSelectedProduct(product);
  };

  const handleConfirmProduct = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    setSelectedProduct(null);
    setIsManualModalOpen(false);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handlePrint = (order: Order) => {
      // Browser print
      setReceiptOrder(order);
  };

  // Corrected cartTotal calculation to include quantity
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const finishOrder = async () => {
    // Calculate final total with fee
    const deliveryFee = customer.orderType === OrderType.DELIVERY ? (customer.deliveryFee || 0) : 0;
    const finalTotal = cartTotal + deliveryFee;

    const newOrder: Order = {
        id: Date.now().toString(),
        customer,
        items: cart,
        total: finalTotal, // Save with fee
        createdAt: new Date().toISOString(),
        status: OrderStatus.PENDING
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    
    // Trigger Print
    handlePrint(newOrder);

    setView('HOME');
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
                cartTotal={cartTotal}
                onViewSummary={() => setView('SUMMARY')}
                onBack={() => setView('FORM')}
                onSelectProduct={setSelectedProduct}
                onManualItem={() => setIsManualModalOpen(true)}
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
                onEditForm={() => setView('FORM')}
            />
        )}

        {view === 'HISTORY' && (
            <div className="h-screen flex flex-col">
                <div className="p-4 glass flex justify-between items-center border-b border-white/5 sticky top-0 z-10">
                    <button onClick={() => setView('HOME')} className="text-[#D6BB56] font-bold">&larr; Voltar</button>
                    <h2 className="text-xl font-bold text-white">Histórico</h2>
                    <div className="w-10"></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
                    {orders.length === 0 ? (
                        <div className="glass-card p-8 rounded-xl text-center mt-10 text-gray-400">Sem pedidos.</div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="glass-card rounded-xl p-4 mb-4 border-l-4 border-[#D6BB56]">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{order.customer.name}</h3>
                                        <p className="text-xs text-[#D6BB56] font-bold">{order.customer.orderType} {order.customer.tableNumber && `#${order.customer.tableNumber}`}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditOrder(order)} 
                                            className="text-sm bg-white/5 text-gray-300 font-bold px-3 py-1 rounded border border-white/10 hover:bg-white/10"
                                        >
                                            EDITAR ✏️
                                        </button>
                                        <button 
                                            onClick={() => handlePrint(order)} 
                                            className="text-sm bg-[#D6BB56] text-[#292927] font-bold px-3 py-1 rounded shadow-md hover:brightness-110"
                                        >
                                            REIMPRIMIR 🖨️
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    {order.items.length} itens - {order.customer.paymentMethod}
                                </div>
                                <p className="font-bold text-right text-white mt-2">R$ {order.total.toFixed(2)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
        
        {/* Modals */}
        <ProductModal 
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onConfirm={handleConfirmProduct}
        />
        <ManualItemModal
            isOpen={isManualModalOpen}
            onClose={() => setIsManualModalOpen(false)}
            onConfirm={handleConfirmProduct}
        />
      </div>
    </div>
  );
}