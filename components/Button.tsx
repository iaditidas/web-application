
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-black text-white hover:bg-gray-800",
    outline: "border-2 border-red-600 text-red-600 hover:bg-red-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
