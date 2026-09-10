import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qfqrehdsdrvzxqrottdb.supabase.co'
const supabasePublishableKey = 'sb_publishable_KjIlrY_vqA9WUHzQ1JE56w_PxI1U419'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
