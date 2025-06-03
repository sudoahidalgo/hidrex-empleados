import { createClient } from '@supabase/supabase-js'

// Read Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
