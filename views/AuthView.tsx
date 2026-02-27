
import React, { useState } from 'react';
import { Button } from '../components/Button.tsx';
import { mockStore } from '../services/mockStore.ts';
import { User } from '../types.ts';

export const AuthView: React.FC<{ onAuth: (user: User) => void }> = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = email.endsWith('@flashman.com') ? 'ADMIN' : 'USER';
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role,
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    };
    mockStore.setUser(user);
    onAuth(user);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto animate-fade-in">
      <div className="mt-12 mb-8">
        <h2 className="text-3xl font-black mb-2 uppercase italic text-red-600">Flash Man</h2>
        <p className="text-gray-500 font-medium">
          {isLogin ? 'Welcome back! Get your food in a flash.' : 'Join the fastest delivery network.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-xl outline-none transition-all"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email.endsWith('@flashman.com') && (
            <p className="text-xs mt-1 text-red-600 font-bold uppercase tracking-tighter italic">Admin Portal Access Detected</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-xl outline-none transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <Button fullWidth type="submit" className="mt-4">
          {isLogin ? 'LOG IN' : 'SIGN UP'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>

      <div className="mt-auto py-8">
        <p className="text-[10px] text-gray-300 text-center uppercase tracking-[0.3em]">
          Secured by FlashMan Logistics
        </p>
      </div>
    </div>
  );
};
