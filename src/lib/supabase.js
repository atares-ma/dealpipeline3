import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // Surface a clear message rather than a cryptic network error downstream.
  console.error(
    'Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env',
  );
}

export const supabase = createClient(url, key);
