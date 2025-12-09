import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  // Glassmorphism base styles
  const baseStyle = "font-bold py-3 px-6 rounded-xl transition-all active:scale-95 focus:outline-none shadow-lg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm";
  
  const variants = {
    // Gold gradient for primary
    primary: "bg-gradient-to-r from-[#D6BB56] to-[#C5AB4B] text-[#1a1a1a] hover:brightness-110 border border-[#D6BB56]/50",
    
    // Glassy dark for secondary
    secondary: "bg-white/5 text-[#D6BB56] border border-[#D6BB56]/30 hover:bg-white/10",
    
    // Glassy red for danger
    danger: "bg-red-600/80 text-white hover:bg-red-600 border border-red-500/50"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      type={props.type || 'button'} // Default to button to prevent form submission bugs
      className={`${baseStyle} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};