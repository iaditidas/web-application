
import React, { useEffect } from 'react';
import { Icons } from '../constants.tsx';

export const SplashView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-red-600 flex flex-col items-center justify-center text-white p-6 z-50 overflow-hidden">
      {/* Background Boxes */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-lg animate-float"
            style={{
              width: `${Math.random() * 40 + 20}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 animate-fade-in flex flex-col items-center">
        <div className="bg-white text-red-600 p-4 rounded-full mb-4 shadow-xl">
          <Icons.Flash />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2 italic">FLASH MAN</h1>
        <p className="text-sm font-medium opacity-90 uppercase tracking-[0.2em]">Fast • Fresh • Flash</p>
      </div>
      
      <div className="absolute bottom-12 flex flex-col items-center z-10">
        <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="w-full h-full bg-white animate-loading" />
        </div>
      </div>
      
      <style>{`
        @keyframes loading-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-loading {
          animation: loading-slide 1s infinite linear;
        }
        .animate-float {
          animation: float 15s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
