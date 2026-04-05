'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, Users, Clock, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalEmployees: 0,
    pendingApprovals: 0
  })
  const [userEmail, setUserEmail] = useState<string>('')
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      // 1. දැනට ලොග් වෙලා ඉන්න කෙනාව ගන්නවා (අලුතින් එකතු කරපු කෑල්ල)
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        // Email එකේ @ එකට කලින් තියෙන කෑල්ල අරන් මුල් අකුර ලොකු කරනවා (උදා: admin@... -> Admin)
        const namePart = user.email.split('@')[0]
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)
        setUserEmail(formattedName)
      } else {
        setUserEmail('Admin') // User කෙනෙක් නැත්නම් නිකන්ම Admin කියලා දානවා
      }

      // 2. මුළු සේවකයින් ගණන ගන්නවා
      const { count: empCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })

      // 3. මුළු OT Logs ගණන ගන්නවා
      const { count: logsCount } = await supabase
        .from('ot_logs')
        .select('*', { count: 'exact', head: true })

      // 4. අන්තිමට දාපු OT Records 5ක් ගන්නවා (Recent Activity)
      const { data: logs } = await supabase
        .from('ot_logs')
        .select(`
          id,
          normal_ot,
          friday_ot,
          month_year,
          employees (full_name, emp_id_no)
        `)
        .order('id', { ascending: false })
        .limit(5)

      setStats({
        totalEmployees: empCount || 0,
        totalLogs: logsCount || 0,
        pendingApprovals: 2 
      })
      setRecentLogs(logs || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="text-blue-500 animate-spin" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight italic">Dashboard View</h1>
        {/* මෙතන තමයි නම වැටෙන්නේ 👇 */}
        <h2 className="text-zinc-500 mt-2 font-medium">
          Welcome back, <span className="text-blue-400">{userEmail}</span>
        </h2>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Total Logs */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] relative overflow-hidden group">
          <Clock className="text-zinc-800 absolute -right-4 -top-4" size={120} />
          <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest relative z-10">Total OT Logs</h3>
          <p className="text-5xl font-black text-white mt-4 tracking-tighter relative z-10">{stats.totalLogs.toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-4 text-emerald-500 text-sm font-bold relative z-10">
            <ArrowUpRight size={16} /> Live from database
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] shadow-sm">
          <Users className="text-zinc-500 mb-6" size={32} />
          <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Active Employees</h3>
          <p className="text-5xl font-black text-white mt-2 tracking-tighter">{stats.totalEmployees}</p>
          <p className="text-emerald-500 text-xs font-bold mt-4 tracking-wide">● System Operational</p>
        </div>

        {/* Pending Approvals (Placeholder) */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] shadow-sm">
          <AlertTriangle className="text-amber-600 mb-6" size={32} />
          <h3 className="text-zinc-500 font-bold uppercase text-xs tracking-widest">Needs Review</h3>
          <p className="text-5xl font-black text-white mt-2 tracking-tighter">00</p>
          <p className="text-zinc-600 text-xs font-bold mt-4 tracking-wide text-white/40">Everything up to date</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[40px] p-10">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Recent OT Logs
        </h3>
        
        <div className="space-y-4">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                    {log.employees?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold">{log.employees?.full_name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{log.employees?.emp_id_no} • {log.month_year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-black">{log.normal_ot || log.friday_ot} hrs</p>
                  <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">
                    {log.friday_ot > 0 ? 'Friday OT' : 'Normal OT'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-600 text-center italic py-10">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  )
}