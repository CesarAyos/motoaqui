import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    persistSession: true, // Asegúrate de habilitar la persistencia de la sesión
    autoRefreshToken: true,
  });
  


import { createClient } from '@supabase/supabase-js';


