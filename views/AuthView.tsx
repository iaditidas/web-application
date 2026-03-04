
import React, { useState } from 'react';
import { Button } from '../components/Button.tsx';
import { mockStore } from '../services/mockStore.ts';
import { User } from '../types.ts';

export const AuthView: React.FC<{ onAuth: (user: User) => void }> = ({ onAuth }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = identifier.includes('@');
    const role = isEmail && identifier.endsWith('@flashman.com') ? 'ADMIN' : 'USER';
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: isEmail ? identifier : undefined,
      phone: !isEmail ? identifier : undefined,
      role,
      name: name || (isEmail ? (identifier.split('@')[0].charAt(0).toUpperCase() + identifier.split('@')[0].slice(1)) : 'User ' + identifier.slice(-4)),
    };
    mockStore.setUser(user);
    onAuth(user);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto animate-fade-in">
      <div className="mt-12 mb-8">
        <h2 className="text-3xl font-black mb-2 uppercase italic text-emerald-600">Flash Man</h2>
        <p className="text-stone-500 font-medium">
          {isLogin ? 'Welcome back! Get your food in a flash.' : 'Join the fastest delivery network.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Your Name</label>
            <input 
              type="text" 
              required
              className="w-full p-4 bg-stone-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white rounded-xl outline-none transition-all"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Email or Phone Number</label>
          <input 
            type="text" 
            required
            className="w-full p-4 bg-stone-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white rounded-xl outline-none transition-all"
            placeholder="name@example.com or 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {identifier.endsWith('@flashman.com') && (
            <p className="text-xs mt-1 text-emerald-600 font-bold uppercase tracking-tighter italic">Admin Portal Access Detected</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full p-4 bg-stone-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white rounded-xl outline-none transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <Button fullWidth type="submit" variant="secondary" className="mt-4">
          {isLogin ? 'LOG IN' : 'SIGN UP'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>

      <div className="mt-auto py-8">
        <p className="text-[10px] text-stone-300 text-center uppercase tracking-[0.3em]">
          Secured by FlashMan Logistics
        </p>
      </div>
    </div>
  );
};
