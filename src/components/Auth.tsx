import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!supabase) {
      setError('Supabase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (!data.user) throw new Error('Login failed.');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto glass-card border-gold-500/20 overflow-hidden !p-0"
    >
      <div className="glass-dark p-10 text-center border-x-0 border-t-0 border-b-white/5">
        <div className="inline-block p-4 glass-gold rounded-2xl mb-6 shadow-lg">
          <Lock size={40} className="text-gold-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gold-500 tracking-tight">Admin Portal</h2>
        <p className="text-white/40 mt-2 font-medium">Please sign in to continue</p>
      </div>

      <form onSubmit={handleAuth} className="p-10 space-y-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass text-red-400 border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-sm"
          >
            <AlertCircle className="shrink-0" size={18} />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <div className="space-y-2">
          <label htmlFor="auth-email" className="text-xs font-bold text-gold-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold-500 transition-colors" size={18} />
            <input 
              id="auth-email"
              name="auth-email"
              type="email" 
              placeholder="admin@ugrasena.edu" 
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-white placeholder-white/10" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="auth-password" className="text-xs font-bold text-gold-500 uppercase tracking-[0.2em] ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold-500 transition-colors" size={18} />
            <input 
              id="auth-password"
              name="auth-password"
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 outline-none transition-all text-white placeholder-white/10" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-gold-500 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full glass-gold text-gold-500 py-4 rounded-xl font-bold text-lg hover:bg-gold-500 hover:text-navy-900 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-gold-500/20 uppercase tracking-[0.2em]" 
          disabled={loading || !supabase}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
    </motion.div>
  );
}
