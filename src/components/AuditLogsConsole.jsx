import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Skeleton from './ui/Skeleton';
import Table from './ui/Table';
import { borderRadius, spacing, typography } from '../styles/designTokens';

const AuditLogsConsole = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });

      // Apply Search
      if (search) {
        query = query.or(`action.ilike.%${search}%,endpoint.ilike.%${search}%,user_role.ilike.%${search}%`);
      }

      // Apply Action Filter
      if (actionFilter !== 'All') {
        query = query.eq('action', actionFilter);
      }

      // Apply Status Filter
      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter);
      }

      // Apply Date Range
      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }

      // Sorting & Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, statusFilter, startDate, endDate, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      header: 'Timestamp',
      render: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
      header: 'User ID',
      render: (row) => row.user_id ? String(row.user_id).slice(0, 8) + '...' : 'Anonymous',
    },
    {
      header: 'Role',
      render: (row) => <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{row.user_role || 'anonymous'}</span>,
    },
    {
      header: 'Action',
      render: (row) => <Badge status={row.action.includes('failed') ? 'danger' : 'neutral'}>{row.action}</Badge>,
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status === 'success' ? 'success' : 'danger'}>{row.status}</Badge>,
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedLog(row)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <Card title="Database Audit Logs Console" subtitle="Immutable compliance & activity ledger">
      
      {/* Filters Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, marginBottom: '20px' }}>
        <Input
          id="audit-search"
          placeholder="Search by action, endpoint, or role..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        
        <Select
          id="action-filter"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          options={[
            { label: 'All Actions', value: 'All' },
            { label: 'auth_login', value: 'auth_login' },
            { label: 'auth_logout', value: 'auth_logout' },
            { label: 'auth_failed_login', value: 'auth_failed_login' },
            { label: 'user_created', value: 'user_created' },
            { label: 'complaint_created', value: 'complaint_created' },
            { label: 'complaint_assigned', value: 'complaint_assigned' },
            { label: 'complaint_status_changed', value: 'complaint_status_changed' },
            { label: 'profile_update', value: 'profile_update' },
            { label: 'broadcast_created', value: 'broadcast_created' },
          ]}
        />

        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          options={[
            { label: 'All Statuses', value: 'All' },
            { label: 'Success', value: 'success' },
            { label: 'Failed', value: 'failed' },
            { label: 'Error', value: 'error' },
          ]}
        />

        <div style={{ display: 'flex', gap: spacing.sm }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              style={{ padding: '8px', borderRadius: borderRadius.sm, border: '1px solid #ccc', width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              style={{ padding: '8px', borderRadius: borderRadius.sm, border: '1px solid #ccc', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height="40px" />
          <Skeleton height="40px" />
          <Skeleton height="40px" />
        </div>
      ) : (
        <>
          <Table columns={columns} data={logs} keyField="id" emptyText="No audit logs matching filters." />
          
          {/* Pagination Controls */}
          {totalCount > limit && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              <span style={{ fontSize: typography.fontSize.sm }}>
                Showing { (page - 1) * limit + 1 } - { Math.min(page * limit, totalCount) } of { totalCount } records
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * limit >= totalCount}
                  onClick={() => setPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: borderRadius.lg, maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '1.25rem', color: '#000' }}>Log Record Details</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <p><strong>Log ID:</strong> {selectedLog.id}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedLog.created_at).toLocaleString()}</p>
              <p><strong>User ID:</strong> {selectedLog.user_id || 'Anonymous / Unauthenticated'}</p>
              <p><strong>User Role:</strong> {selectedLog.user_role || 'anonymous'}</p>
              <p><strong>Action Executed:</strong> {selectedLog.action}</p>
              <p><strong>Target Type:</strong> {selectedLog.entity_type}</p>
              <p><strong>Target ID:</strong> {selectedLog.entity_id || 'N/A'}</p>
              <p><strong>Endpoint Path:</strong> {selectedLog.endpoint}</p>
              <p><strong>Request Method:</strong> {selectedLog.request_method}</p>
              <p><strong>User Agent:</strong> {selectedLog.user_agent}</p>
              
              <div>
                <strong>Old Payload State:</strong>
                <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: borderRadius.sm, overflowX: 'auto', fontSize: '0.8rem', marginTop: '4px' }}>
                  {JSON.stringify(selectedLog.old_data, null, 2)}
                </pre>
              </div>

              <div>
                <strong>New Payload State:</strong>
                <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: borderRadius.sm, overflowX: 'auto', fontSize: '0.8rem', marginTop: '4px' }}>
                  {JSON.stringify(selectedLog.new_data, null, 2)}
                </pre>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button variant="primary" size="sm" onClick={() => setSelectedLog(null)}>Close Details</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AuditLogsConsole;
