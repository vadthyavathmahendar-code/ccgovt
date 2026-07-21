import React from 'react';
import { useTheme } from '../../context/useTheme';
import { typography } from '../../styles/designTokens';

const Tabs = ({ tabs = [], activeTab, onChange }) => {
  const { themeColors } = useTheme();

  return (
    <div style={{ display: 'flex', borderBottom: `2px solid ${themeColors.borderLight}`, gap: '4px', overflowX: 'auto' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? `3px solid ${themeColors.primary}` : '3px solid transparent',
              padding: '12px 18px',
              fontSize: typography.fontSize.sm,
              fontWeight: isActive ? typography.fontWeight.bold : typography.fontWeight.medium,
              color: isActive ? themeColors.primary : themeColors.textSecondary,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              marginBottom: '-2px',
            }}
            role="tab"
            aria-selected={isActive}
          >
            {tab.label} {tab.count !== undefined && <span style={{ marginLeft: '6px', opacity: 0.8, fontSize: '0.75rem' }}>({tab.count})</span>}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
