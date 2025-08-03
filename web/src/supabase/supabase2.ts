import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL2;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY2;
const supabase2 = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // This is the rate limit
    }
  },
  auth: { 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'my-app/1.0'
    }
  }
});

export default supabase2;
