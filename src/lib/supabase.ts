import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = (val: string | undefined) => !val || val === 'YOUR_SUPABASE_URL' || val === 'YOUR_SUPABASE_ANON_KEY';

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.warn('Supabase URL and Anon Key are missing or using placeholders. Please check your environment variables in the Secrets panel.');
}

export const supabase = (!isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey)) 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        storage: window.localStorage,
        detectSessionInUrl: true,
      }
    }) 
  : null;
