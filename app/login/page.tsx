'use client'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Zap, Lock, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Invalid email or password. Please try again.')
    } 
    // මෙතන Success වුණොත් මොකුත් ලියන්න ඕනේ නෑ. 
    // layout.tsx එකේ තියෙන onAuthStateChange එකෙන් ඔටෝම අල්ලගෙන Dashboard එක පෙන්වනවා!
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#09090b]">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[40px] shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-white/5">
            <Zap size={32} className="text-black fill-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">PowerTech</h1>
          <p className="text-zinc-500 font-medium mt-2">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-zinc-500 outline-none text-white font-semibold transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:border-zinc-500 outline-none text-white font-semibold transition-all" 
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <button 
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  )
}