import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pekgrvqgrlumtvvzecmy.supabase.co"
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBla2dydnFncmx1bXR2dnplY215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDU1NzIsImV4cCI6MjA5MzQ4MTU3Mn0.Bfa7FhkLQtx173js4iE9bveHPjxEDSrW4f69AQV8Olw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
