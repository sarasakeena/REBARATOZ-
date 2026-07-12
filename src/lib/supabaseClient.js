/**
 * REBARATOZ — Supabase Client (Browser-compatible UMD script)
 *
 * This script uses the global `supabase` object provided by the UMD build
 * included via a <script> tag in the HTML files. This avoids CORS issues
 * when opening the HTML files directly (file:/// protocol) without a server.
 */

const supabaseUrl = 'https://ybznmjbgzpmfgnhcnnel.supabase.co'
const supabaseAnonKey = 'sb_publishable_CqaArlkHmt7hkAnZOqEXgw_U71saQ4r'

if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.error("Supabase script failed to load from CDN.");
}