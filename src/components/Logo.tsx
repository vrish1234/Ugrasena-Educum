import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const Logo = () => {
  const [logoUrl, setLogoUrl] = useState("https://raw.githubusercontent.com/vrishketuray0/ugrasena-educum/main/logo.png");

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
      <img 
        src={logoUrl} 
        alt="Ugrasena Educum Logo" 
        className="h-12 w-auto object-contain"
        referrerPolicy="no-referrer"
      />
      <span className="font-bold text-lg text-gold-500 hidden md:block">UGRASENA EDUCUM</span>
    </div>
  );
};
