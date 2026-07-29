import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ReportCenter = ({ complaints = [], theme, themeColors }) => {
  const [reportType, setReportType] = useState('daily');
  const [department, setDepartment] = useState('All');
  const [ward, setWard] = useState('All');
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedData, setGeneratedData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});

  const departments = ['All', 'Roads', 'Garbage', 'Water', 'Electricity', 'Traffic'];
  const wards = ['All', 'Ward 1 - Gachibowli', 'Ward 2 - Madhapur', 'Ward 3 - Jubilee Hills', 'Ward 4 - Banjara Hills', 'Ward 5 - Begumpet'];

  const handleGenerateReport = () => {
    let filtered = [...complaints];

    // Apply Department filter
    if (department !== 'All') {
      filtered = filtered.filter(c => c.category === department);
    }
    
    // Apply Ward filter
    if (ward !== 'All') {
      filtered = filtered.filter(c => c.ward === ward);
    }

    // Filter by date range depending on report type
    const now = new Date();
    if (reportType === 'daily') {
      filtered = filtered.filter(c => {
        const date = new Date(c.created_at);
        return date.toDateString() === now.toDateString();
      });
    } else if (reportType === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(c => new Date(c.created_at) >= oneWeekAgo);
    } else if (reportType === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(c => new Date(c.created_at) >= oneMonthAgo);
    }

    setGeneratedData(filtered);
    setIsGenerated(true);

    // Compute stats
    const total = filtered.length;
    const resolved = filtered.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const pending = filtered.filter(c => c.status === 'Pending' || c.status === 'Assigned').length;
    const critical = filtered.filter(c => c.priority === 'Critical').length;
    const solveRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0.0';

    setSummaryStats({
      total,
      resolved,
      pending,
      critical,
      solveRate
    });

    toast.success('📊 Municipal Report compiled and generated successfully!');
  };

  const handleExportCSV = () => {
    if (generatedData.length === 0) {
      toast.error('No records available to export.');
      return;
    }
    
    const headers = ['Complaint ID', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Created At'];
    const rows = generatedData.map(c => [
      c.id,
      `"${c.title?.replace(/"/g, '""')}"`,
      c.category,
      c.priority || 'Normal',
      c.status,
      c.assigned_to || 'Unassigned',
      new Date(c.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CC_Municipal_Report_${reportType}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📥 CSV file exported successfully!');
  };

  const handleExportExcel = () => {
    // Generate clean Tab-Delimited sheet format for direct double-click loading in Excel
    if (generatedData.length === 0) {
      toast.error('No records available to export.');
      return;
    }
    
    const headers = ['Complaint ID', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Created At'];
    const rows = generatedData.map(c => [
      c.id,
      c.title?.replace(/\t/g, ' '),
      c.category,
      c.priority || 'Normal',
      c.status,
      c.assigned_to || 'Unassigned',
      new Date(c.created_at).toLocaleDateString()
    ]);

    const excelContent = [headers.join('\t'), ...rows.map(e => e.join('\t'))].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CC_Municipal_Report_${reportType}_${new Date().toLocaleDateString()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('📥 Excel worksheet generated successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', paddingRight: '5px' }}>
      
      {/* Report Controls */}
      <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(30, 41, 59, 0.45)' : '#ffffff', border: `1px solid ${themeColors.border}` }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 'bold' }}>📋 Report Generation Parameters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={styles.label}>Cycle Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ ...styles.select, color: themeColors.textPrimary, background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#fff' }}>
              <option value="daily">Daily Report (Today)</option>
              <option value="weekly">Weekly Report (Last 7 Days)</option>
              <option value="monthly">Monthly Audit (Last 30 Days)</option>
              <option value="all">Cumulative Master Ledger</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ ...styles.select, color: themeColors.textPrimary, background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#fff' }}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Ward Boundary</label>
            <select value={ward} onChange={(e) => setWard(e.target.value)} style={{ ...styles.select, color: themeColors.textPrimary, background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#fff' }}>
              {wards.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              onClick={handleGenerateReport}
              style={{
                width: '100%',
                padding: '10px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🔄 Compile Report Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Sheet */}
      {isGenerated && (
        <div id="printable-report-area" style={{ ...styles.card, background: theme === 'dark' ? 'rgba(30, 41, 59, 0.45)' : '#ffffff', border: `1px solid ${themeColors.border}` }}>
          
          {/* Action Toolbar */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
            <button onClick={handleExportCSV} style={styles.actionBtn}>📥 Export CSV</button>
            <button onClick={handleExportExcel} style={styles.actionBtn}>📊 Export Excel</button>
            <button onClick={handlePrint} style={{ ...styles.actionBtn, background: '#10b981', color: 'white', borderColor: '#10b981' }}>🖨️ Print / Save PDF</button>
          </div>

          {/* Report Sheet Head */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <img src="/images/cc_logo.png" alt="Logo" style={{ width: '60px', height: '45px', marginBottom: '8px' }} />
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 'bold' }}>Municipal Operations Command Center</h2>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.75rem', color: '#64748b' }}>
              Enterprise Performance Ledger &bull; Compiled: {new Date().toLocaleString()}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', padding: '12px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total Tickets</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6' }}>{summaryStats.total}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Resolved</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#22c55e' }}>{summaryStats.resolved}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Pending Allocation</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#eab308' }}>{summaryStats.pending}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Critical Escalate</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444' }}>{summaryStats.critical}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>SLA Solve Rate</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>{summaryStats.solveRate}%</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f1f5f9' }}>
                  <th style={{ padding: '10px' }}>Complaint ID</th>
                  <th style={{ padding: '10px' }}>Title</th>
                  <th style={{ padding: '10px' }}>Category</th>
                  <th style={{ padding: '10px' }}>Priority</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Assigned Employee</th>
                  <th style={{ padding: '10px' }}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {generatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No record files match the active filters for this cycle.</td>
                  </tr>
                ) : (
                  generatedData.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>#{String(c.id).slice(0, 8).toUpperCase()}</td>
                      <td style={{ padding: '10px', fontWeight: '500' }}>{c.title}</td>
                      <td style={{ padding: '10px' }}>{c.category}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          background: c.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.02)',
                          color: c.priority === 'Critical' ? '#ef4444' : '#64748b'
                        }}>{c.priority || 'Normal'}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          background: c.status === 'Resolved' || c.status === 'Closed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 88, 12, 0.15)',
                          color: c.status === 'Resolved' || c.status === 'Closed' ? '#22c55e' : '#ea580c'
                        }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '10px' }}>{c.assigned_to || 'Unassigned'}</td>
                      <td style={{ padding: '10px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginBottom: '6px',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  actionBtn: {
    padding: '8px 14px',
    background: 'none',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#475569',
    transition: '0.2s'
  }
};

export default ReportCenter;
