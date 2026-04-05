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
  X 
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
   <aside className="w-72 bg-[#09090b] border-r border-zinc-800 flex flex-col p-4 h-screen z-50 shadow-2xl md:shadow-none">
      
      {/* --- Brand Identity (Logo එක) --- */}
      <div className="flex items-center justify-between mb-10 px-0">
        <div className="flex items-center justify-center w-full">
          
          {/* මෙන්න Logo එක උපරිම පළලටම (w-full) ගත්තා */}
          <img 
            src="/logo.png" 
            alt="System Logo" 
            className="w-full h-auto max-h-55 object-contain drop-shadow-2xl" 
          />

        </div>
        
        {/* ෆෝන් එකේදී Sidebar එක වහන බටන් එක */}
        <button onClick={onClose} className="md:hidden text-zinc-500 hover:text-white p-1 ml-2 transition-colors">
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
              onClick={onClose} 
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