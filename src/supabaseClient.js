import { createClient } from '@supabase/supabase-js'

// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO SUPABASE
const supabaseUrl = 'https://ywawglicmuzluplnxyxa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3YXdnbGljbXV6bHVwbG54eXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzA4NTYsImV4cCI6MjA2Mzk0Njg1Nn0.eaVhmm95dX-LijfG-tJ7UJ4gzFB5-95llXLtpTVs1c4'

export const supabase = createClient(supabaseUrl, supabaseKey)
