/* 
  Supabase Configuration
  Using the public API key and URL to initialize the Supabase client.
*/

// We'll use the CDN version since this is a simple static site without a heavy bundler for now,
// or we can expect the user to include the script in index.html.

const SUPABASE_URL = 'https://bzmqskkcgczijdyfuifw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_op-TsCJ1idRNC1sCstS9Lw_lAz61C2V';

// Note: In a production environment, you should use environment variables.
// Since this is a client-side public key, it's safe to be in the code as per Supabase's design.

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
