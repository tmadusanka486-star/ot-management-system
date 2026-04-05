'use client'

import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { Search } from 'lucide-react'

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [reportData, setReportData] = useState<any[]>([])
  const [detailedLogs, setDetailedLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  async function generateReport(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMonth) return
    setLoading(true)

    const current = new Date(selectedMonth + "-01");
    current.setMonth(current.getMonth() - 1);
    const prevMonth = current.toISOString().substring(0, 7);

    const { data: setts } = await supabase.from('settings').select('*').single()
    const nLimit = setts ? setts.normal_ot_limit : 56
    const fLimit = setts ? setts.friday_ot_limit : 100

    const { data: emps } = await supabase.from('employees').select('*').order('emp_id_no', { ascending: true })
    const { data: allLogs } = await supabase
      .from('ot_logs')
      .select('*, employees(full_name, emp_id_no)')
      .or(`month_year.like.${selectedMonth}%,month_year.like.${prevMonth}%`)

    // මේ මාසයේ logs ටික (Excel එකේ දෙවැනි sheet එකට)
    const currentMonthLogs = allLogs?.filter(l => l.month_year.startsWith(selectedMonth)) || []
    setDetailedLogs(currentMonthLogs)

    const finalData = emps?.map(emp => {
      const prevLogs = allLogs?.filter(l => l.employee_id === emp.id && l.month_year.startsWith(prevMonth)) || []
      const pNormalRaw = prevLogs.reduce((sum, l) => sum + (l.normal_ot || 0), 0)
      const pFridayRaw = prevLogs.reduce((sum, l) => sum + (l.friday_ot || 0), 0)
      const prevBalN = Math.max(0, pNormalRaw - nLimit)
      const prevBalF = Math.max(0, pFridayRaw - fLimit)

      const currLogs = allLogs?.filter(l => l.employee_id === emp.id && l.month_year.startsWith(selectedMonth)) || []
      const currNormalRaw = currLogs.reduce((sum, l) => sum + (l.normal_ot || 0), 0)
      const currFridayRaw = currLogs.reduce((sum, l) => sum + (l.friday_ot || 0), 0)

      const totalNormal = currNormalRaw + prevBalN
      const totalFriday = currFridayRaw + prevBalF
      
      const payableNormal = Math.min(totalNormal, nLimit)
      const payableFriday = Math.min(totalFriday, fLimit)
      
      const balanceNormal = Math.max(0, totalNormal - nLimit)
      const balanceFriday = Math.max(0, totalFriday - fLimit)

      return {
        empId: emp.emp_id_no,
        name: emp.full_name,
        normalTotal: totalNormal,
        fridayTotal: totalFriday,
        payableNormal: payableNormal,
        payableFriday: payableFriday,
        normalBal: balanceNormal,
        fridayBal: balanceFriday,
        totalPayable: payableNormal + payableFriday
      }
    }) || []

    setReportData(finalData)
    setLoading(false)
  }

  // සර්ච් කරපු දත්ත වෙන් කිරීම
  const filteredSummary = reportData.filter(row => 
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    row.empId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function downloadExcel() {
    const workbook = new ExcelJS.Workbook()
    
    // --- SHEET 1: MONTHLY SUMMARY ---
    const summarySheet = workbook.addWorksheet('Monthly Summary')
    summarySheet.columns = [
      { header: 'Emp ID', key: 'empId', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Normal Total', key: 'normalTotal', width: 15 },
      { header: 'Friday Total', key: 'fridayTotal', width: 15 },
      { header: 'Payable Normal', key: 'payableNormal', width: 18 },
      { header: 'Payable Friday', key: 'payableFriday', width: 18 },
      { header: 'Normal Bal', key: 'normalBal', width: 15 },
      { header: 'Friday Bal', key: 'fridayBal', width: 15 },
      { header: 'TOTAL PAYABLE', key: 'totalPayable', width: 20 },
    ]
    filteredSummary.forEach(row => summarySheet.addRow(row))

    // --- SHEET 2: DAILY DETAILED LOGS ---
    const detailedSheet = workbook.addWorksheet('Daily Detailed Logs')
    detailedSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Emp ID', key: 'empId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'OT Hours', key: 'hours', width: 12 },
      { header: 'Category', key: 'type', width: 15 },
    ]

    detailedLogs
      .filter(log => 
        log.employees.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.employees.emp_id_no.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(a.month_year).getTime() - new Date(b.month_year).getTime())
      .forEach(log => {
        detailedSheet.addRow({
          date: log.month_year,
          empId: log.employees.emp_id_no,
          name: log.employees.full_name,
          hours: log.normal_ot || log.friday_ot,
          type: log.friday_ot > 0 ? 'Friday OT' : 'Normal OT'
        })
      })

    workbook.worksheets.forEach(ws => {
      const headerRow = ws.getRow(1)
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } }
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

      ws.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' }
          }
          if (rowNumber > 1) cell.alignment = { horizontal: 'center' }
        })
        
        // Sheet 1 Total Payable Highlight
        if (ws.name === 'Monthly Summary' && rowNumber > 1) {
          row.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
          row.getCell(9).font = { bold: true }
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, `OT_Report_${selectedMonth}.xlsx`)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-6">📊 Professional OT Report</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex gap-4 items-end mb-8 shadow-2xl">
        <div className="flex-1">
          <label className="block text-sm font-bold mb-2">Target Month</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
            className="w-full bg-gray-700 p-3 rounded border border-gray-600 text-white outline-none focus:border-blue-500 transition" 
          />
        </div>
        <button 
          onClick={generateReport} 
          disabled={loading}
          className="bg-blue-600 px-8 py-3 rounded font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
        {reportData.length > 0 && (
          <button onClick={downloadExcel} className="bg-green-600 px-8 py-3 rounded font-bold hover:bg-green-700 transition flex items-center gap-2">
            📥 Download Styled Excel
          </button>
        )}
      </div>

      {/* Search Bar */}
      {reportData.length > 0 && (
        <div className="mb-6 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Employee ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 p-3 pl-10 rounded-xl border border-gray-700 text-white outline-none focus:border-blue-500 transition shadow-lg"
          />
        </div>
      )}

      {/* Table */}
      {filteredSummary.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="p-4 border-r border-gray-700">Emp ID</th>
                <th className="p-4 border-r border-gray-700">Name</th>
                <th className="p-4 text-blue-300">Normal Total</th>
                <th className="p-4 text-green-300">Friday Total</th>
                <th className="p-4 text-blue-400 font-bold border-l border-gray-700 bg-gray-800/50">Payable Normal</th>
                <th className="p-4 text-green-400 font-bold bg-gray-800/50">Payable Friday</th>
                <th className="p-4 text-red-300 font-bold border-l border-gray-700">New Bal N</th>
                <th className="p-4 text-red-300 font-bold">New Bal F</th>
                <th className="p-4 font-extrabold text-yellow-400 bg-gray-700/30">TOT PAYABLE</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummary.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="p-4 font-mono border-r border-gray-700">{row.empId}</td>
                  <td className="p-4 border-r border-gray-700">{row.name}</td>
                  <td className="p-4">{row.normalTotal}</td>
                  <td className="p-4">{row.fridayTotal}</td>
                  <td className="p-4 text-blue-400 font-bold border-l border-gray-700 bg-gray-800/30">{row.payableNormal}</td>
                  <td className="p-4 text-green-400 font-bold bg-gray-800/30">{row.payableFriday}</td>
                  <td className="p-4 text-red-300 font-bold border-l border-gray-700">{row.normalBal}</td>
                  <td className="p-4 text-red-300 font-bold">{row.fridayBal}</td>
                  <td className="p-4 font-extrabold text-yellow-400 bg-gray-700/20">{row.totalPayable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportData.length > 0 && filteredSummary.length === 0 && (
        <div className="text-center p-10 bg-gray-800 rounded-xl border border-gray-700 text-gray-400">
          No employees found matching "{searchTerm}"
        </div>
      )}
    </div>
  )
}