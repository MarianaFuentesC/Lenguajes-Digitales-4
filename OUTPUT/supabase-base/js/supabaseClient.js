// =========================================
// Supabase client — loaded 2nd (after the CDN library)
// The CDN creates the global `supabase` object; from it we build ONE client
// that datos.js uses for every query.
// The anon key is public by design: what protects the data are the
// RLS policies defined in sql/schema.sql. NEVER put the service_role key here.
// =========================================

const SUPABASE_URL = "https://snflhbvcvsuvbtxrxzlv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuZmxoYnZjdnN1dmJ0eHJ4emx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODg1NDYsImV4cCI6MjEwNzY2NDU0Nn0.uyJJzB9T8tBXXfsBGWiNNmiDi08Wbl1lGJSXotl1zcY";

// Named supabaseClient (not supabase) so we don't overwrite the library global
// El script del CDN crea una variable global "supabase" que trae
// la función createClient(). La usamos para crear NUESTRO propio
// cliente, y lo guardamos en una variable con otro nombre (db) para
// no confundirla con el objeto global de la librería.
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);