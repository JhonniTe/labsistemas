import { createClient } from '@supabase/supabase-js';

// Variables de entorno Vite (dev local) con fallback hardcodeado para Vercel
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://xymhdijrtqvksmdtrkhk.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bWhkaWpydHF2a3NtZHRya2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjcyNDcsImV4cCI6MjA5MjYwMzI0N30.EjaRmWpCM4BfRmKNQbu65jBhdiW5KTdQfmcimLiGb70';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
