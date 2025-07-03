// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://xmrwzwzjgjccbhrtsgkr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtcnd6d3pqZ2pjY2JocnRzZ2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjM3NDIsImV4cCI6MjA2NzA5OTc0Mn0.Dl3AT-q6LYix-KYwsrrgjFji0ESQqRtvFj9kXKy6Tno'
};

// Initialize Supabase client
let supabase;

// Function to initialize Supabase
function initSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase initialized successfully');
        return supabase;
    } else {
        console.error('❌ Supabase library not loaded');
        return null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, initSupabase };
} 