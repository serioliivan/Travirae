// Create global Supabase client for the browser (ANON key; RLS keeps rows safe)
window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
