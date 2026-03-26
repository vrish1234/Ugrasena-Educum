import React from 'react';

export const Logo = ({ url }: { url?: string }) => {
  const defaultLogo = "https://raw.githubusercontent.com/vrishketuray0/ugrasena-educum/main/logo.png";
  
  return (
    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-gold-500/30">
      <img 
        src={url || defaultLogo} 
        alt="Ugrasena Educum Logo" 
        className="h-12 w-auto object-contain"
        referrerPolicy="no-referrer"
      />
      <span className="font-bold text-lg text-amber-400 hidden md:block">UGRASENA EDUCUM</span>
    </div>
  );
};
