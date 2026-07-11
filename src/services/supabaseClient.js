import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these placeholders with your actual Supabase project credentials later
const supabaseUrl = 'https://rxoirnheajrjahhrdppd.supabase.co';
const supabaseAnonKey = 'sb_publishable_wk9TaUVjPKx6sV672GTQQg_RI9UOAp-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});