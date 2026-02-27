
import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types.ts';
import { Icons } from '../constants.tsx';
import { Button } from '../components/Button.tsx';
import { mockStore } from '../services/mockStore.ts';

export const TrackingView: React.FC<{ order: Order, onBack: () => void }> = ({ order, onBack }) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const orders = mockStore.getOrders();
        const freshOrder = orders.find(o => o.id === order.id);
        if (freshOrder) setCurrentOrder(freshOrder);
      } catch (e) {
        console.error('Tracking update failed', e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [order.id]);

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PENDING', label: 'Ordered', desc: 'Kitchen received your request' },
    { status: 'PREPARING', label: 'Preparing', desc: 'Chefs are working their magic' },
    { status: 'OUT_FOR_DELIVERY', label: 'On the Way', desc: 'Flash Rider is zooming to you' },
    { status: 'DELIVERED', label: 'Delivered', desc: 'Enjoy your fresh meal!' }
  ];

  const currentIdx = steps.findIndex(s => s.status === currentOrder.status);

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 animate-fade-in">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-red-600">
          <Icons.History />
        </button>
        <div>
          <h2 className="text-xl font-black italic">TRACK ORDER</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentOrder.id}</p>
        </div>
      </header>

      <div className="bg-red-600 text-white rounded-3xl p-8 mb-12 shadow-2xl shadow-red-100 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Estimated Arrival</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-6xl font-black italic">12</h3>
            <span className="text-xl font-bold uppercase italic">MINS</span>
          </div>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <Icons.Flash />
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Details</p>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${currentOrder.paymentMode === 'UPI' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {currentOrder.paymentMode}
          </span>
        </div>
        {currentOrder.upiDetails && (
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-gray-600">{currentOrder.upiDetails.provider}</p>
            <p className="text-xs font-black text-gray-900">{currentOrder.upiDetails.upiId}</p>
          </div>
        )}
        {!currentOrder.upiDetails && (
          <p className="text-xs font-bold text-gray-600">Cash on Delivery</p>
        )}
      </div>

      <div className="space-y-10 pl-4 relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>
        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.status} className="flex gap-6 relative">
              <div className={`w-3 h-3 rounded-full z-10 mt-1.5 ring-4 ${
                isDone ? 'bg-red-600 ring-red-100' : 
                isCurrent ? 'bg-red-600 animate-pulse ring-red-100' : 
                'bg-gray-200 ring-transparent'
              }`} />
              <div>
                <h4 className={`font-black uppercase tracking-tight ${isPending ? 'text-gray-300' : 'text-gray-900'}`}>
                  {step.label}
                </h4>
                <p className={`text-xs font-medium ${isPending ? 'text-gray-200' : 'text-gray-500'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-8 flex flex-col items-center">
        <div className="bg-gray-50 w-full p-4 rounded-2xl border border-gray-100 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
            <Icons.User />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Flash Rider</p>
            <p className="font-black uppercase">Deepak R.</p>
          </div>
          <button className="ml-auto bg-red-600 p-3 rounded-xl text-white">
            <Icons.Flash />
          </button>
        </div>
        <Button variant="outline" fullWidth onClick={onBack}>BACK TO DASHBOARD</Button>
      </div>
    </div>
  );
};
