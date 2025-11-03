/**
 * Configuration for Property Import Tool
 * AJ Real Estate System - Supabase Connection
 */

const config = {
  supabase: {
    url: 'https://gcuunlxfgtnppnqkikaz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjdXVubHhmZ3RucHBucWtpa2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzY3MTgsImV4cCI6MjA3NzE1MjcxOH0.8uKySCjd_f8sqOtYAyD2_MyvQIC_2IsYkHE1NoqtQT4'
  }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}
