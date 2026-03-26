import React, { useState } from 'react';
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
      setError('Supabase is not configured. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Email not confirmed. Please check your inbox or disable "Confirm Email" in Supabase Auth settings.');
        }
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
        throw authError;
      }
      if (!data.user) throw new Error('Login failed. No user data returned.');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-gold-100 overflow-hidden">
      <div className="bg-navy-900 p-8 text-center">
        <h2 className="text-3xl font-bold text-gold-500 mb-2">
          Admin Login
        </h2>
        <p className="text-gold-500/60 text-sm">
          Login to access the admin dashboard
        </p>
      </div>

      <form onSubmit={handleAuth} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="shrink-0" size={18} />
            <p>{error}</p>
          </div>
        )}

        {!supabase && !error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="shrink-0" size={18} />
            <p><strong>Configuration Error:</strong> Supabase keys are missing in Settings.</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" 
              placeholder="admin@example.com" 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-900 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-navy-900 text-gold-500 py-4 rounded-xl font-bold text-lg hover:bg-navy-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-navy-900/20" 
          disabled={loading || !supabase}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></span>
              Logging in...
            </span>
          ) : 'Login'}
        </button>

        <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
          <p className="text-xs text-gray-500 leading-relaxed font-bold">
            Registration is disabled. Only authorized administrators can log in.
          </p>
          <div className="text-[10px] text-gray-400 text-left space-y-1">
            <p>• Ensure you have created an account in the Supabase Dashboard.</p>
            <p>• Check if "Confirm Email" is disabled in Supabase Auth settings.</p>
            <p>• Verify that your email and password are correct.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
