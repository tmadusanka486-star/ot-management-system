'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Clock, User, Calendar, Plus, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function EntryPage() {
  const [empId, setEmpId] = useState('')
  const [date, setDate] = useState('')
  const [otHours, setOtHours] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const [limits, setLimits] = useState({ normal: 56, friday: 100 })
  const [currentOT, setCurrentOT] = useState({ normal: 0, friday: 0 })
  const [isFriday, setIsFriday] = useState(false)

  useEffect(() => {
    if (date) {
      setIsFriday(new Date(date).getDay() === 5)
      fetchStats()
    }
  }, [date, empId])

  async function fetchStats() {
    if (!empId || !date) return
    const month = date.substring(0, 7)
    const { data: setts } = await supabase.from('settings').select('*').single()
    if (setts) setLimits({ normal: setts.normal_ot_limit, friday: setts.friday_ot_limit })

    const { data: logs } = await supabase
      .from('ot_logs')
      .select('normal_ot, friday_ot, employees!inner(emp_id_no)')
      .eq('employees.emp_id_no', empId)
      .like('month_year', `${month}%`)

    const totals = logs?.reduce((acc, curr) => ({
      normal: acc.normal + (curr.normal_ot || 0),
      friday: acc.friday + (curr.friday_ot || 0)
    }), { normal: 0, friday: 0 }) || { normal: 0, friday: 0 }
    
    setCurrentOT(totals)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: emp } = await supabase.from('employees').select('id, full_name').eq('emp_id_no', empId).single()
    
    if (!emp) {
      setMessage({ text: 'Employee ID not found!', type: 'error' })
      setLoading(false)
      return
    }

    const { error } = await supabase.from('ot_logs').insert([{
      employee_id: emp.id,
      month_year: date,
      normal_ot: isFriday ? 0 : parseFloat(otHours),
      friday_ot: isFriday ? parseFloat(otHours) : 0
    }])

    if (!error) {
      setMessage({ text: `Success! Recorded for ${emp.full_name}`, type: 'success' })
      setOtHours('')
      fetchStats()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">Daily OT Entry</h2>
        <p className="text-slate-500 mt-1">Add overtime records for employees manually.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#121826] border border-slate-800 rounded-[32px] p-8 shadow-sm">
             <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Employee ID</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input type="text" required value={empId} onChange={e => setEmpId(e.target.value.toUpperCase())} className="w-full bg-[#0b0f1a] border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none text-white font-semibold" placeholder="TS-101" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-500 outline-none text-white color-scheme-dark" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">OT Hours</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="number" step="0.5" required value={otHours} onChange={e => setOtHours(e.target.value)} className="w-full bg-[#0b0f1a] border border-slate-700 rounded-2xl py-5 pl-12 pr-4 focus:border-blue-500 outline-none text-2xl font-bold text-white" placeholder="0.0" />
                  </div>
                </div>
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 transition-all">
                  {loading ? 'Processing...' : 'Submit OT Record'} <ChevronRight size={20} />
                </button>
             </form>
          </div>
          {message.text && (
            <div className={`mt-6 p-5 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-semibold">{message.text}</span>
            </div>
          )}
        </div>

        <div className="bg-[#121826] border border-slate-800 rounded-[32px] p-8 h-fit space-y-6">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[2px]">Monthly Status</h3>
           <div className="space-y-6">
              <div className={isFriday ? 'opacity-30' : 'opacity-100'}>
                <div className="flex justify-between text-xs font-bold mb-2"><span>Normal OT</span><span>{currentOT.normal}h / {limits.normal}h</span></div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${Math.min((currentOT.normal / limits.normal) * 100, 100)}%` }} />
                </div>
              </div>
              <div className={!isFriday ? 'opacity-30' : 'opacity-100'}>
                <div className="flex justify-between text-xs font-bold mb-2"><span>Friday OT</span><span>{currentOT.friday}h / {limits.friday}h</span></div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min((currentOT.friday / limits.friday) * 100, 100)}%` }} />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}