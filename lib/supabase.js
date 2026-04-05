import { createClient } from '@supabase/supabase-js'

// අර අපි .env.local එකේ හැංගුව යතුරු දෙක මෙතනින් ගන්නවා
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// මේකෙන් තමයි Supabase එකට කනෙක්ෂන් එක හදන්නේ
export const supabase = createClient(supabaseUrl, supabaseKey)