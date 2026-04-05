'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function EmployeesPage() {
  const [empId, setEmpId] = useState('')
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => { fetchEmployees() }, [])

  async function fetchEmployees() {
    const { data } = await supabase.from('employees').select('*').order('emp_id_no', { ascending: true })
    if (data) setEmployees(data)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      await supabase.from('employees').update({ full_name: fullName, position: position }).eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('employees').insert([{ emp_id_no: empId, full_name: fullName, position: position }])
    }
    setEmpId(''); setFullName(''); setPosition('');
    fetchEmployees()
  }

  async function deleteEmployee(id: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      await supabase.from('employees').delete().eq('id', id)
      fetchEmployees()
    }
  }

  const filteredEmployees = employees.filter(emp => 
    (emp.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (emp.emp_id_no?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-gray-100">
      <h1 className="text-3xl font-bold">Employee Management</h1>
      
      {/* Form */}
      <form onSubmit={handleSave} className="bg-gray-800 p-6 rounded-xl border border-gray-700 grid grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm mb-1">Emp ID</label>
          {/* value එක null ආවොත් '' විදිහට ගන්න හැදුවා */}
          <input disabled={!!editingId} value={empId || ''} onChange={e => setEmpId(e.target.value.toUpperCase())} className="w-full bg-gray-700 p-2 rounded border border-gray-600" />
        </div>
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input value={fullName || ''} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-700 p-2 rounded border border-gray-600" />
        </div>
        <div>
          <label className="block text-sm mb-1">Position</label>
          <input value={position || ''} onChange={e => setPosition(e.target.value)} className="w-full bg-gray-700 p-2 rounded border border-gray-600" />
        </div>
        <button className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700">
          {editingId ? 'Update' : 'Add Employee'}
        </button>
      </form>

      {/* Search Bar */}
      <input 
        placeholder="🔍 Search by name or ID..." 
        className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 text-white"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Position</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="border-t border-gray-700 hover:bg-gray-750">
                <td className="p-4 font-mono text-blue-400">{emp.emp_id_no}</td>
                <td className="p-4">{emp.full_name}</td>
                <td className="p-4">{emp.position || '-'}</td>
                <td className="p-4 flex justify-center gap-4">
                  {/* Edit කරනකොට null ආවොත් හිස් අකුරක් යවන්න හැදුවා */}
                  <button onClick={() => { 
                    setEditingId(emp.id); 
                    setEmpId(emp.emp_id_no || ''); 
                    setFullName(emp.full_name || ''); 
                    setPosition(emp.position || ''); 
                  }} className="text-yellow-500 hover:underline font-semibold">Edit</button>
                  
                  <button onClick={() => deleteEmployee(emp.id)} className="text-red-500 hover:underline font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}