import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!supabase) return;

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Check your email for confirmation!');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleAuth} className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <input type="email" placeholder="Email" className="block w-full p-2 mb-2 border" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" className="block w-full p-2 mb-2 border" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit" className="bg-navy-900 text-gold-500 px-4 py-2 rounded" disabled={loading}>{loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}</button>
      <button type="button" className="ml-2 text-sm text-gray-600 underline" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
    </form>
  );
}
