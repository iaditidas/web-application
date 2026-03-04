
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, User } from '../types.ts';
import { mockStore } from '../services/mockStore.ts';
import { Icons } from '../constants.tsx';
import { Button } from '../components/Button.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AdminDashboard: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'LIVE' | 'ANALYTICS' | 'SETTINGS'>('LIVE');
  const [kitchenStatus, setKitchenStatus] = useState(mockStore.getKitchenStatus());
  const [opHours, setOpHours] = useState(mockStore.getOperationalHours());
  const [adminUpi, setAdminUpi] = useState(mockStore.getAdminUpi());

  const fetchOrders = () => {
    try {
      setOrders(mockStore.getOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = (orderId: string, status: OrderStatus) => {
    mockStore.updateOrderStatus(orderId, status);
    fetchOrders();
  };

  const stats = [
    { name: '09:00', orders: 12 },
    { name: '10:00', orders: 19 },
    { name: '11:00', orders: 25 },
    { name: '12:00', orders: 45 },
    { name: '13:00', orders: 38 },
    { name: '14:00', orders: 20 },
    { name: '15:00', orders: 15 },
    { name: '16:00', orders: 10 },
  ];

  const pendingOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((acc, curr) => acc + curr.totalAmount, 0);

  const handleSaveConfig = () => {
    mockStore.setOperationalHours(opHours);
    mockStore.setKitchenStatus(kitchenStatus);
    mockStore.setAdminUpi(adminUpi);
    alert('Configuration saved successfully!');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <aside className="w-64 bg-stone-900 text-white p-6 flex flex-col sticky top-0 h-screen">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic text-orange-600 mb-1">FLASH ADMIN</h1>
          <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">Ops Control v2.1</p>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('LIVE')}
            className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'LIVE' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <Icons.Flash /> LIVE FEED
          </button>
          <button 
            onClick={() => setActiveTab('ANALYTICS')}
            className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'ANALYTICS' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <Icons.History /> ANALYTICS
          </button>
          <button 
            onClick={() => setActiveTab('SETTINGS')}
            className={`w-full text-left p-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'SETTINGS' ? 'bg-orange-600 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
          >
            <Icons.User /> SETTINGS
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-600/10 rounded-full flex items-center justify-center text-orange-600">
              <Icons.User />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest truncate">{user.email || user.phone}</p>
              <p className="text-[9px] font-black text-orange-600 uppercase italic">Administrator</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-600/10 text-orange-600 font-black text-xs uppercase hover:bg-orange-600 hover:text-white transition-all"
          >
            <Icons.LogOut />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 max-h-screen overflow-y-auto">
        {activeTab === 'LIVE' ? (
          <div className="space-y-8">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tight italic text-stone-900">Order Command Center</h2>
                <p className="text-stone-400 font-medium">Real-time kitchen & dispatch management</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center min-w-[120px]">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Queue</p>
                  <p className="text-2xl font-black text-stone-900">{pendingOrders.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 text-center min-w-[120px]">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-1">Rev Today</p>
                  <p className="text-2xl font-black text-green-600">₹{revenue}</p>
                </div>
              </div>
            </header>

            <div className="grid gap-4">
              {pendingOrders.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-stone-200 flex flex-col items-center">
                  <div className="p-4 bg-stone-50 rounded-full mb-4 text-stone-300"><Icons.Flash /></div>
                  <p className="text-stone-400 font-bold uppercase tracking-widest">No Active Orders</p>
                </div>
              ) : (
                pendingOrders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border border-stone-100 flex items-center gap-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black text-orange-600 italic uppercase bg-orange-50 px-2 py-1 rounded">#{order.id}</span>
                        <span className="text-xs font-bold text-stone-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="font-bold text-lg mb-1 text-stone-900">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                        <p className="text-xs text-stone-500 font-medium">Customer: {order.userEmail || order.userPhone}</p>
                        <p className="text-xs text-stone-500 font-medium">Total: <span className="font-black text-stone-900">₹{order.totalAmount}</span></p>
                        <p className="text-xs text-stone-500 font-medium">Mode: <span className={`font-black uppercase ${order.paymentMode === 'UPI' ? 'text-blue-600' : 'text-orange-600'}`}>{order.paymentMode}</span></p>
                        {order.upiDetails && (
                          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                            <p className="text-[10px] text-blue-700 font-black uppercase tracking-tight">
                              {order.upiDetails.provider}: {order.upiDetails.upiId}
                            </p>
                            <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-black">PAID</span>
                          </div>
                        )}
                        {!order.upiDetails && order.paymentMode === 'COD' && (
                          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
                            <p className="text-[10px] text-orange-700 font-black uppercase tracking-tight">Collect Cash on Delivery</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant={order.status === 'PENDING' ? 'primary' : 'outline'} 
                        className="py-2 px-4 text-xs"
                        onClick={() => updateStatus(order.id, 'PREPARING')}
                        disabled={order.status !== 'PENDING'}
                      >KITCHEN</Button>
                      <Button 
                        variant={order.status === 'PREPARING' ? 'primary' : 'outline'} 
                        className="py-2 px-4 text-xs"
                        onClick={() => updateStatus(order.id, 'OUT_FOR_DELIVERY')}
                        disabled={order.status !== 'PREPARING'}
                      >DISPATCH</Button>
                      <Button 
                        variant={order.status === 'OUT_FOR_DELIVERY' ? 'primary' : 'outline'} 
                        className="py-2 px-4 text-xs"
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        disabled={order.status !== 'OUT_FOR_DELIVERY'}
                      >ARRIVED</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'ANALYTICS' ? (
          <div className="space-y-10">
            <h2 className="text-4xl font-black uppercase tracking-tight italic text-stone-900">Performance Analytics</h2>
            
            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm h-[400px]">
              <h3 className="font-black mb-6 uppercase tracking-widest text-sm text-stone-400">Hourly Order Volume</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#78716c'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#78716c'}} />
                  <Tooltip 
                    cursor={{fill: '#f5f5f4'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.orders > 30 ? '#ea580c' : '#1c1917'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="space-y-10 max-w-2xl">
            <h2 className="text-4xl font-black uppercase tracking-tight italic text-stone-900">System Configuration</h2>
            <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-bold text-lg text-stone-900">Shop Operational Status</h4>
                  <p className="text-stone-500 text-sm">Force close the shop for all users</p>
                </div>
                <button 
                  onClick={() => setKitchenStatus(!kitchenStatus)}
                  className={`w-14 h-8 rounded-full relative transition-colors ${kitchenStatus ? 'bg-orange-600' : 'bg-stone-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${kitchenStatus ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-bold text-lg border-b border-stone-100 pb-2 text-stone-900">Operational Hours (24h Format)</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Opening Hour</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="23"
                      value={opHours.start}
                      onChange={(e) => setOpHours({ ...opHours, start: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:border-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Closing Hour</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="23"
                      value={opHours.end}
                      onChange={(e) => setOpHours({ ...opHours, end: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:border-orange-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-bold text-lg border-b border-stone-100 pb-2 text-stone-900">Payment Configuration</h4>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Your Business UPI ID (for receiving payments)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. yourname@okaxis"
                    value={adminUpi}
                    onChange={(e) => setAdminUpi(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:border-orange-600 font-bold text-stone-900"
                  />
                  <p className="text-[10px] text-stone-400 mt-2 italic">All customer UPI payments will be directed to this ID.</p>
                </div>
              </div>

              <Button variant="hungry" fullWidth onClick={handleSaveConfig}>SAVE CONFIGURATION</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
