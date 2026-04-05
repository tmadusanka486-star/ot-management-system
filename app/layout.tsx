'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from './components/Sidebar'
import LoginPage from './login/page'
import './globals.css'
import { Loader2, Menu, Zap } from 'lucide-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // අලුත් state එකක්

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <html lang="en">
      <body className="bg-[#09090b] text-slate-200">
        {loading ? (
          <div className="flex min-h-screen items-center justify-center">
             <Loader2 className="animate-spin text-zinc-500" size={40} />
          </div>
        ) : !session ? (
          <LoginPage />
        ) : (
          <div className="flex h-screen overflow-hidden relative">
            
            {/* Mobile Menu කළු පාට Background Overlay එක */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Sidebar එක (ෆෝන් එකේදී හැංගිලා තියෙන්නේ, Button එක එබුවම එනවා) */}
            <div className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-300 ease-in-out z-50`}>
              {/* Sidebar එකට onClose function එක යවනවා */}
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* Main Content (දකුණු පැත්තේ තියෙන කොටස) */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
              
              {/* Mobile Header (ෆෝන් එකේදී විතරක් පේන උඩ කෑල්ල) */}
              <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-[#09090b] z-30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-black fill-black" />
                  </div>
                  <span className="font-bold text-white">PowerTech</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(true)} 
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <Menu size={24} />
                </button>
              </div>

              {/* Page Content එක */}
              <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                {children}
              </main>
            </div>

          </div>
        )}
      </body>
    </html>
  )
}