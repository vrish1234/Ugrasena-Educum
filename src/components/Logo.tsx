import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const Logo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogo() {
      if (!supabase) return;
      const { data } = await supabase.from('company_info').select('logo_url').eq('id', 1).single();
      if (data && data.logo_url) setLogoUrl(data.logo_url);
    }
    fetchLogo();

    const channel = supabase?.channel('company_info_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'company_info', filter: 'id=eq.1' }, (payload: any) => {
        if (payload.new.logo_url) setLogoUrl(payload.new.logo_url);
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-gold-500/30">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Ugrasena Educum Logo" 
          className="h-12 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-12 w-12 bg-gold-500/20 rounded flex items-center justify-center text-gold-500 font-bold">
          UE
        </div>
      )}
      <span className="font-bold text-lg text-gold-500 hidden md:block">UGRASENA EDUCUM</span>
    </div>
  );
};
