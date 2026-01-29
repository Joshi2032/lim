import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkyechfkombhptjhsdpn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWVjaGZrb21iaHB0amhzZHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDEzMTEsImV4cCI6MjA4NTIxNzMxMX0.2KpoLvyph_TkjmJPnkDYGpQZf7S1_WiyQvIlzRr15Q4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
