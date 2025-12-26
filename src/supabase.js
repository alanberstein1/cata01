// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkgqbzgpsiklxiiunhix.supabase.co';
const supabaseAnonKey = 'sb_publishable_TIS6kTUzzsGocVQGpYcZzg_z8TwgfLb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
