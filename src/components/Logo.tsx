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
    <div className="flex items-center gap-4 glass-dark p-2.5 px-5 rounded-2xl border border-gold-500/20 shadow-2xl group hover:border-gold-500/40 transition-all duration-500">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Ugrasena Educum Logo" 
          className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_10px_rgba(251,192,45,0.3)] group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-10 w-10 md:h-14 md:w-14 glass-gold rounded-xl flex items-center justify-center text-gold-500 font-black text-xl border border-gold-500/30 shadow-inner">
          UE
        </div>
      )}
      <div className="flex flex-col leading-none">
        <span className="font-black text-base md:text-2xl text-gold-500 tracking-tighter uppercase italic">UGRASENA</span>
        <span className="font-bold text-[10px] md:text-sm text-white/40 uppercase tracking-[0.3em] mt-0.5">EDUCUM</span>
      </div>
    </div>
  );
};
