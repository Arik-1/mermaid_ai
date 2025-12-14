import React from 'react';

interface WireframeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const WireframeButton: React.FC<WireframeButtonProps> = ({ 
  children, 
  active, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      className={`
        px-6 py-2 
        border-2 border-black 
        text-sm font-bold uppercase tracking-wider
        transition-all duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active 
          ? 'bg-black text-white' 
          : 'bg-white text-black hover:bg-black hover:text-white'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
