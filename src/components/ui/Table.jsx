import React from 'react';
import { useTheme } from '../../context/useTheme';
import { typography, borderRadius } from '../../styles/designTokens';
import EmptyState from './EmptyState';

const Table = ({ columns = [], data = [], keyField = 'id', emptyText = 'No data available' }) => {
  const { themeColors } = useTheme();

  if (data.length === 0) {
    return <EmptyState title="No Records Available" description={emptyText} />;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: borderRadius.md, border: `1px solid ${themeColors.borderLight}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: themeColors.surface }}>
        <thead>
          <tr style={{ background: themeColors.surfaceSecondary, borderBottom: `2px solid ${themeColors.borderLight}` }}>
            {columns.map((col) => (
              <th
                key={col.key || col.header}
                style={{
                  padding: '12px 16px',
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.bold,
                  color: themeColors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyField]} style={{ borderBottom: `1px solid ${themeColors.borderLight}` }}>
              {columns.map((col) => (
                <td key={col.key || col.header} style={{ padding: '14px 16px', fontSize: typography.fontSize.sm, color: themeColors.textPrimary }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
