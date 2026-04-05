'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Clock, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Zap,
  X // අලුතින් import කළා
} from 'lucide-react'

// props විදිහට onClose ගන්නවා
export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Daily OT Entry', icon: Clock, path: '/entry' },
    { name: 'Manage Employees', icon: Users, path: '/employees' },
    { name: 'Monthly Reports', icon: FileText, path: '/reports' },
    { name: 'Settings & Limits', icon: Settings, path: '/settings' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <aside className="w-72 bg-[#09090b] border-r border-zinc-800 flex flex-col p-7 h-screen z-50 shadow-2xl md:shadow-none">
      
      {/* --- Brand Identity --- */}
      <div className="flex items-center justify-between mb-12 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
            <Zap size={22} className="text-black fill-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight tracking-tight">Over Time</h1>
           <h2 className="text-lg font-bold text-white leading-tight tracking-tight">Management System</h2>
          </div>
        </div>
        
        {/* ෆෝන් එකේදී Sidebar එක වහන බටන් එක */}
        <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-white p-1">
          <X size={24} />
        </button>
      </div>

      {/* --- Navigation Links --- */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link 
              key={item.name} 
              href={item.path}
              onClick={onClose} // ලින්ක් එකක් ක්ලික් කළාමත් ෆෝන් එකේ මෙනු එක ඔටෝ වහන්න
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
                isActive 
                ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <item.icon 
                size={20} 
                className={`transition-colors ${isActive ? 'text-white' : 'group-hover:text-zinc-300'}`} 
              />
              <span className="font-bold tracking-tight">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* --- Bottom Actions (Logout Button) --- */}
      <div className="pt-6 border-t border-zinc-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold border border-transparent hover:border-red-500/10"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
      
    </aside>
  )
}