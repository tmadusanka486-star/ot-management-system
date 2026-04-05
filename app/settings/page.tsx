'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function SettingsPage() {
  const [normalLimit, setNormalLimit] = useState(56)
  const [fridayLimit, setFridayLimit] = useState(100)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*').single()
    if (data) {
      setNormalLimit(data.normal_ot_limit)
      setFridayLimit(data.friday_ot_limit)
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    // id 1 තියෙන පේළිය අප්ඩේට් කරනවා
    const { error } = await supabase
      .from('settings')
      .update({ normal_ot_limit: normalLimit, friday_ot_limit: fridayLimit })
      .eq('id', 1)

    if (error) {
      setMessage('❌ Failed to update settings!')
    } else {
      setMessage('✅ Limits updated successfully!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-100 mt-4">
      <h1 className="text-3xl font-bold border-b border-gray-700 pb-4">⚙️ System Settings</h1>
      
      <form onSubmit={saveSettings} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl space-y-6">
        <h2 className="text-xl font-semibold text-gray-300">Monthly OT Limits</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <label className="block text-sm font-bold text-blue-300 mb-2">📅 Normal OT Limit (Hours)</label>
            <input 
              type="number" 
              value={normalLimit}
              onChange={(e) => setNormalLimit(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-white font-bold text-lg"
            />
          </div>

          <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
            <label className="block text-sm font-bold text-green-300 mb-2">🗓️ Friday OT Limit (Hours)</label>
            <input 
              type="number" 
              value={fridayLimit}
              onChange={(e) => setFridayLimit(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-white font-bold text-lg"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md font-bold text-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>

        {message && (
          <p className={`text-center font-bold p-3 rounded ${message.includes('✅') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}