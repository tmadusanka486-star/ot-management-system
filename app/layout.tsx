'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // ../ වෙනුවට @/ දැම්මා
import Sidebar from './components/Sidebar' // ../ වෙනුවට @/ දැම්මා
import LoginPage from './login/page'
import './globals.css'
import { Loader2 } from 'lucide-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. පේජ් එක ලෝඩ් වෙද්දී දැනටමත් ලොගින් වෙලාද කියලා බලනවා
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. කවුරු හරි ලොගින් වුණොත් හරි ලොග්අවුට් වුණොත් හරි මේකෙන් අල්ලගන්නවා
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <html lang="en">
      <body className="bg-[#09090b] text-slate-200">
        {loading ? (
          // ලෝඩ් වෙනකන් පෙන්වන එක
          <div className="flex min-h-screen items-center justify-center">
             <Loader2 className="animate-spin text-zinc-500" size={40} />
          </div>
        ) : !session ? (
          // ලොගින් වෙලා නැත්නම් ලොගින් පේජ් එක පෙන්වනවා (Sidebar එක පෙන්නන්නේ නෑ)
          <LoginPage />
        ) : (
          // ලොගින් වෙලා නම් Sidebar එකයි, අනිත් පේජ් ටිකයි පෙන්වනවා
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  )
}