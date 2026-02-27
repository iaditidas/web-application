
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
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [upiDetails, setUpiDetails] = useState({ provider: '', upiId: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const opHours = mockStore.getOperationalHours();

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
      alert('Please provide all UPI details.');
      return;
    }

    if (paymentMode === 'UPI') {
      setIsVerifying(true);
      setTimeout(() => {
        completeOrder(paymentMode);
      }, 1500);
    } else {
      completeOrder(paymentMode);
    }
  };

  const completeOrder = (paymentMode: 'UPI' | 'COD') => {
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: user.id,
      userEmail: user.email,
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

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      <header className="bg-white px-6 pt-12 pb-6 border-b sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-black italic text-red-600">FLASH MAN</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Local Node #001</p>
          </div>
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
            <Icons.LogOut />
          </button>
        </div>

        {!isShopOpen && (
          <div className="bg-black text-white p-3 rounded-lg flex items-center gap-3 mb-4 text-sm animate-pulse">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <p className="font-bold">
              {!kitchenStatus ? 'KITCHEN CLOSED BY ADMIN' : `KITCHEN CLOSED: BACK AT ${opHours.start.toString().padStart(2, '0')}:00`}
            </p>
          </div>
        )}

        {isShopOpen && activeOrders.length > 0 && (
          <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg shadow-red-200 mb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Active Order</p>
                <p className="text-lg font-black">{activeOrders[0]?.status.replace(/_/g, ' ') || 'PROCESSING'}</p>
              </div>
              <Button variant="secondary" onClick={() => onSelectOrder(activeOrders[0])} className="py-2 px-4 text-xs">TRACK</Button>
            </div>
          </div>
        )}
      </header>

      <main className="p-6">
        {activeTab === 'MENU' ? (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight">Today's Fast Menu</h3>
            <div className="grid gap-4">
              {MENU_ITEMS.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover" />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="font-black text-red-600">₹{item.price}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-2">{item.description}</p>
                    <div className="mt-auto flex justify-end">
                      {cart.find(i => i.id === item.id) ? (
                        <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 gap-3">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 hover:text-red-600"
                          >-</button>
                          <span className="text-xs font-black w-4 text-center">
                            {cart.find(i => i.id === item.id)?.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-gray-500 hover:text-green-600"
                          >+</button>
                        </div>
                      ) : (
                        <button 
                          disabled={!isShopOpen}
                          onClick={() => addToCart(item)}
                          className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-30"
                        >
                          + ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'CART' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Your Flash Cart</h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs font-bold text-gray-400 hover:text-red-600 uppercase">Clear All</button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4 text-gray-300"><Icons.Cart /></div>
                <p className="text-gray-400 font-medium mb-4">Your cart is empty.</p>
                <Button variant="outline" onClick={() => setActiveTab('MENU')}>BROWSE MENU</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  {cart.map((item, idx) => (
                    <div key={item.id} className={`p-4 flex items-center justify-between ${idx !== cart.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400 font-black uppercase">₹{item.price} / UNIT</p>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 gap-4 mx-4">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center font-bold text-gray-400 hover:text-red-600">-</button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center font-bold text-gray-400 hover:text-green-600">+</button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-black text-red-600">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="font-bold">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest">Delivery Fee</span>
                    <span className="font-bold text-green-600 uppercase">Free</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="font-black uppercase tracking-[0.2em] text-xs">Grand Total</span>
                    <span className="font-black text-2xl italic">₹{total}</span>
                  </div>
                </div>

                {showUpiForm && (
                  <div className="bg-white p-6 rounded-3xl border-2 border-red-600 shadow-2xl animate-fade-in space-y-6 relative overflow-hidden">
                    {isVerifying && (
                      <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black italic text-red-600 animate-pulse">VERIFYING PAYMENT...</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black uppercase italic text-red-600 text-lg">UPI Checkout</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select your preferred app</p>
                      </div>
                      <button onClick={() => setShowUpiForm(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {upiApps.map(app => (
                        <button
                          key={app.name}
                          onClick={() => setUpiDetails({ ...upiDetails, provider: app.name })}
                          className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${upiDetails.provider === app.name ? 'border-red-600 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className={`w-10 h-10 ${app.color} rounded-xl flex items-center justify-center text-white font-black text-sm mb-2 shadow-lg`}>
                            {app.icon}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{app.name}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Your UPI ID</label>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="e.g. flashman@okaxis"
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none focus:border-red-600 transition-all pl-12"
                            value={upiDetails.upiId}
                            onChange={(e) => setUpiDetails({ ...upiDetails, upiId: e.target.value })}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                            <Icons.User />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button fullWidth onClick={() => placeOrder('UPI')} className="py-4 shadow-xl shadow-red-200">
                        PAY ₹{total} NOW
                      </Button>
                      <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                        100% Secure Payments via FlashPay
                      </p>
                    </div>
                  </div>
                )}

                {!showUpiForm && (
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button className="bg-black text-white py-4 rounded-2xl" onClick={() => placeOrder('UPI')}>PAY VIA UPI</Button>
                    <Button variant="outline" className="py-4 rounded-2xl border-2" onClick={() => placeOrder('COD')}>CASH ON DELIVERY</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase tracking-tight">Order History</h3>
            {pastOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No past orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between mb-2">
                      <p className="text-xs font-bold text-gray-400">{order.id}</p>
                      <p className="text-xs font-black text-red-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    <div className="flex justify-between items-center mt-3">
                      <p className="font-black">₹{order.totalAmount}</p>
                      <div className="flex gap-2">
                        {order.status !== 'CANCELLED' && (
                          <Button 
                            variant="outline" 
                            className="py-1 px-4 text-xs border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-600" 
                            onClick={() => cancelOrder(order.id)}
                          >
                            CANCEL
                          </Button>
                        )}
                        <Button variant="outline" className="py-1 px-4 text-xs" onClick={() => {
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
        <div className="fixed bottom-24 left-6 right-6 bg-red-600 text-white p-4 rounded-2xl shadow-2xl z-30 animate-bounce-in flex justify-between items-center cursor-pointer" onClick={() => setActiveTab('CART')}>
          <div className="flex items-center gap-3">
            <div className="bg-white text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </div>
            <p className="font-black italic uppercase tracking-widest text-sm">View Cart</p>
          </div>
          <p className="font-black text-lg">₹{total}</p>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-4 z-40">
        <button 
          onClick={() => setActiveTab('MENU')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'MENU' ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="p-2"><Icons.Flash /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
        </button>
        <button 
          onClick={() => setActiveTab('CART')}
          className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'CART' ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="p-2">
            <Icons.Cart />
            {cart.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Cart</span>
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'HISTORY' ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <div className="p-2"><Icons.History /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
        </button>
      </nav>
    </div>
  );
};
