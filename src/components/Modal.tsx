import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-xl p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card p-8 rounded-[2.5rem] shadow-2xl border-gold-500/20 max-w-md w-full relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/20 hover:text-gold-500 transition-colors"
        >
          <X size={24} />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
