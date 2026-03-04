
import React, { useState, useEffect } from 'react';
import { User, Order, MenuItem, OrderItem } from '../types.ts';
import { MENU_ITEMS, Icons } from '../constants.tsx';
import { Button } from '../components/Button.tsx';
import { mockStore } from '../services/mockStore.ts';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onSelectOrder: (order: Order) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout, onSelectOrder }) => {
  const [activeTab, setActiveTab] = useState<'MENU' | 'CART' | 'HISTORY'>('MENU');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [upiDetails, setUpiDetails] = useState({ provider: '', upiId: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const opHours = mockStore.getOperationalHours();
  const adminUpiId = mockStore.getAdminUpi();

  const upiApps = [
    { name: 'Google Pay', color: 'bg-blue-500', icon: 'G' },
    { name: 'PhonePe', color: 'bg-purple-600', icon: 'P' },
    { name: 'Paytm', color: 'bg-sky-400', icon: 'Py' },
    { name: 'Amazon Pay', color: 'bg-orange-400', icon: 'A' },
    { name: 'BHIM', color: 'bg-green-600', icon: 'B' },
  ];
  const kitchenStatus = mockStore.getKitchenStatus();

  const now = new Date();
  const currentHour = now.getHours();
  const isShopOpen = kitchenStatus && currentHour >= opHours.start && currentHour < opHours.end;

  useEffect(() => {
    setOrders(mockStore.getOrders().filter(o => o.userId === user.id));
  }, [user.id, activeTab]);

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  const addToCart = (item: MenuItem) => {
    if (!isShopOpen) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      });
      return updated.filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const cancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      mockStore.updateOrderStatus(orderId, 'CANCELLED');
      setOrders(mockStore.getOrders().filter(o => o.userId === user.id));
    }
  };

  const placeOrder = (paymentMode: 'UPI' | 'COD') => {
    if (cart.length === 0) return;
    
    if (paymentMode === 'UPI' && !showUpiForm) {
      setShowUpiForm(true);
      return;
    }

    if (paymentMode === 'UPI' && (!upiDetails.provider || !upiDetails.upiId)) {
      alert('Please provide your UPI details for verification.');
      return;
    }

    if (paymentMode === 'UPI') {
      setIsVerifying(true);
      setTimeout(() => {
        completeOrder(paymentMode);
      }, 2000);
    } else {
      completeOrder(paymentMode);
    }
  };

  const completeOrder = (paymentMode: 'UPI' | 'COD') => {
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: user.id,
      userEmail: user.email,
      userPhone: user.phone,
      items: cart,
      totalAmount: total,
      paymentMode,
      upiDetails: paymentMode === 'UPI' ? upiDetails : undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      etaMinutes: 15
    };
    mockStore.saveOrder(newOrder);
    setCart([]);
    setShowUpiForm(false);
    setIsVerifying(false);
    setUpiDetails({ provider: '', upiId: '' });
    setOrders(prev => [newOrder, ...prev]);
    onSelectOrder(newOrder);
  };

  const filteredMenuItems = MENU_ITEMS.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-40">
      <header className="bg-white px-6 pt-12 pb-6 border-b sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-black italic text-orange-600">FLASH MAN</h2>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Local Node #001</p>
          </div>
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
            <Icons.LogOut />
          </button>
        </div>

        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-black tracking-tight text-stone-900">
            Welcome, <span className="text-orange-600 italic">{user.name}</span>
          </h1>
          <p className="text-stone-500 font-medium">What are we craving today?</p>
        </div>

        {!isShopOpen && (
          <div className="bg-stone-900 text-white p-3 rounded-lg flex items-center gap-3 mb-4 text-sm animate-pulse">
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
            <p className="font-bold">
              {!kitchenStatus ? 'KITCHEN CLOSED BY ADMIN' : `KITCHEN CLOSED: BACK AT ${opHours.start.toString().padStart(2, '0')}:00`}
            </p>
          </div>
        )}

        {isShopOpen && activeOrders.length > 0 && (
          <div className="bg-orange-600 text-white p-4 rounded-xl shadow-lg shadow-orange-200 mb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Active Order</p>
                <p className="text-lg font-black text-white">{activeOrders[0]?.status.replace(/_/g, ' ') || 'PROCESSING'}</p>
              </div>
              <Button variant="secondary" onClick={() => onSelectOrder(activeOrders[0])} className="py-2 px-4 text-xs">TRACK</Button>
            </div>
          </div>
        )}
      </header>

      <main className="p-6">
        {activeTab === 'MENU' ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">Today's Fast Menu</h3>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search for items..."
                  className="w-full p-4 bg-white border border-stone-100 rounded-2xl shadow-sm outline-none focus:border-orange-600 transition-all pl-12 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4">
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
                  <p className="text-stone-400 font-medium">No items found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredMenuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex border border-stone-100">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover" />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-stone-900">{item.name}</h4>
                      <p className="font-black text-orange-600">₹{item.price}</p>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 mb-2">{item.description}</p>
                    <div className="mt-auto flex justify-end">
                      {cart.find(i => i.id === item.id) ? (
                        <div className="flex items-center bg-stone-100 rounded-full px-2 py-1 gap-3">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-stone-500 hover:text-orange-600"
                          >-</button>
                          <span className="text-xs font-black w-4 text-center text-stone-900">
                            {cart.find(i => i.id === item.id)?.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-stone-500 hover:text-green-600"
                          >+</button>
                        </div>
                      ) : (
                        <button 
                          disabled={!isShopOpen}
                          onClick={() => addToCart(item)}
                          className="bg-stone-900 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-orange-600 transition-colors disabled:opacity-30"
                        >
                          + ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        ) : activeTab === 'CART' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">Your Flash Cart</h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs font-bold text-stone-400 hover:text-orange-600 uppercase">Clear All</button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200 flex flex-col items-center">
                <div className="p-4 bg-stone-50 rounded-full mb-4 text-stone-300"><Icons.Cart /></div>
                <p className="text-stone-400 font-medium mb-4">Your cart is empty.</p>
                <Button variant="outline" onClick={() => setActiveTab('MENU')}>GO BACK TO HOME</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                  {cart.map((item, idx) => (
                    <div key={item.id} className={`p-4 flex items-center justify-between ${idx !== cart.length - 1 ? 'border-b border-stone-50' : ''}`}>
                      <div className="flex-1">
                        <p className="font-bold text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-400 font-black uppercase">₹{item.price} / UNIT</p>
                      </div>
                      
                      <div className="flex items-center bg-stone-50 rounded-full px-2 py-1 gap-4 mx-4">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center font-bold text-stone-400 hover:text-orange-600">-</button>
                        <span className="text-xs font-black w-4 text-center text-stone-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center font-bold text-stone-400 hover:text-green-600">+</button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-black text-orange-600">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-400 font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="font-bold text-stone-900">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-400 font-bold uppercase tracking-widest">Delivery Fee</span>
                    <span className="font-bold text-green-600 uppercase">Free</span>
                  </div>
                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                    <span className="font-black uppercase tracking-[0.2em] text-xs text-stone-900">Grand Total</span>
                    <span className="font-black text-2xl italic text-stone-900">₹{total}</span>
                  </div>
                </div>

                {showUpiForm && (
                  <div className="bg-white p-6 rounded-3xl border-2 border-orange-600 shadow-2xl animate-fade-in space-y-6 relative overflow-hidden">
                    {isVerifying && (
                      <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black italic text-orange-600 animate-pulse text-center px-6">VERIFYING YOUR PAYMENT WITH THE BANK...</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black uppercase italic text-orange-600 text-lg">UPI Checkout</h4>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Scan or Pay to Business ID</p>
                      </div>
                      <button onClick={() => setShowUpiForm(false)} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center gap-4">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${adminUpiId}&pn=FlashMan&am=${total}&cu=INR`)}`} 
                          alt="UPI QR Code"
                          className="w-32 h-32"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Pay to Business ID</p>
                        <p className="font-black text-sm text-stone-900">{adminUpiId}</p>
                      </div>
                      <a 
                        href={`upi://pay?pa=${adminUpiId}&pn=FlashMan&am=${total}&cu=INR`}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase text-center shadow-lg shadow-blue-100"
                      >
                        Open UPI App
                      </a>
                    </div>
                    
                    <div className="space-y-4 pt-2 border-t border-stone-100">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">After paying, enter your details below</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {upiApps.slice(0, 4).map(app => (
                          <button
                            key={app.name}
                            onClick={() => setUpiDetails({ ...upiDetails, provider: app.name })}
                            className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${upiDetails.provider === app.name ? 'border-orange-600 bg-orange-50' : 'border-stone-50'}`}
                          >
                            <div className={`w-6 h-6 ${app.color} rounded-md flex items-center justify-center text-white font-black text-[10px]`}>
                              {app.icon}
                            </div>
                            <span className="text-[9px] font-black uppercase text-stone-900">{app.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <input 
                          type="text"
                          placeholder="Your UPI ID (for verification)"
                          className="w-full p-3 bg-stone-50 border-2 border-stone-100 rounded-xl font-bold outline-none focus:border-orange-600 transition-all text-sm"
                          value={upiDetails.upiId}
                          onChange={(e) => setUpiDetails({ ...upiDetails, upiId: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button fullWidth onClick={() => placeOrder('UPI')} className="py-4 shadow-xl shadow-orange-200">
                        I HAVE PAID ₹{total}
                      </Button>
                    </div>
                  </div>
                )}

                {!showUpiForm && (
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button variant="hungry" className="py-4 rounded-2xl" onClick={() => placeOrder('UPI')}>PAY VIA UPI</Button>
                    <Button variant="outline" className="py-4 rounded-2xl border-2 border-orange-600 text-orange-600" onClick={() => placeOrder('COD')}>CASH ON DELIVERY</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight text-stone-900">Order History</h3>
            {pastOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
                <p className="text-stone-400 font-medium">No past orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-xl border border-stone-100">
                    <div className="flex justify-between mb-2">
                      <p className="text-xs font-bold text-stone-400">{order.id}</p>
                      <p className="text-xs font-black text-orange-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-800">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    <div className="flex justify-between items-center mt-3">
                      <p className="font-black text-stone-900">₹{order.totalAmount}</p>
                      <div className="flex gap-2">
                        {order.status !== 'CANCELLED' && (
                          <Button 
                            variant="outline" 
                            className="py-1 px-4 text-xs border-stone-300 text-stone-500 hover:text-orange-600 hover:border-orange-600" 
                            onClick={() => cancelOrder(order.id)}
                          >
                            CANCEL
                          </Button>
                        )}
                        <Button variant="outline" className="py-1 px-4 text-xs border-stone-300 text-stone-500" onClick={() => {
                          setCart(order.items);
                          setActiveTab('MENU');
                        }}>REORDER</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {cart.length > 0 && activeTab === 'MENU' && (
        <div className="fixed bottom-24 left-6 right-6 bg-orange-600 text-white p-4 rounded-2xl shadow-2xl z-30 animate-bounce-in flex justify-between items-center cursor-pointer" onClick={() => setActiveTab('CART')}>
          <div className="flex items-center gap-3">
            <div className="bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </div>
            <p className="font-black italic uppercase tracking-widest text-sm">View Cart</p>
          </div>
          <p className="font-black text-lg">₹{total}</p>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex justify-around p-4 z-40">
        <button 
          onClick={() => setActiveTab('MENU')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'MENU' ? 'text-orange-600' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <div className="p-2"><Icons.Flash /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Menu</span>
        </button>
        <button 
          onClick={() => setActiveTab('CART')}
          className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'CART' ? 'text-orange-600' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <div className="p-2">
            <Icons.Cart />
            {cart.length > 0 && (
              <span className="absolute top-2 right-2 bg-orange-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Cart</span>
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'HISTORY' ? 'text-orange-600' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <div className="p-2"><Icons.History /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900">History</span>
        </button>
      </nav>
    </div>
  );
};
