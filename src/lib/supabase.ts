import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zlvdrafdptwwozfusrsm.supabase.co';
const supabaseKey = 'sb_publishable_gLDfZf8IttaYaPvpQKQL3A_OWiPfyU_';

export const supabase = createClient(supabaseUrl, supabaseKey);
