import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number; // e.g., 12.5 for +12.5%
    isPositive: boolean;
    durationLabel?: string; // e.g., "vs last month"
  };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend }) => {
  return (
    <div 
      className="rounded-2xl p-6 shadow-sm flex flex-col justify-between min-w-[200px] border transition-colors"
      style={{
        backgroundColor: 'rgb(var(--color-surface))',
        borderColor: 'rgb(var(--color-border))'
      }}
    >
      <div>
        <p 
          className="text-xs font-bold uppercase tracking-wider mb-1"
          style={{ color: 'rgb(var(--color-text-secondary))' }}
        >
          {label}
        </p>
        <p 
          className="text-3xl font-black tracking-tight"
          style={{ color: 'rgb(var(--color-text-primary))' }}
        >
          {value}
        </p>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
          <span
            className="px-2 py-0.5 rounded-full flex items-center gap-0.5 bg-opacity-10"
            style={{
              backgroundColor: trend.isPositive ? 'rgb(var(--color-success) / 0.1)' : 'rgb(var(--color-danger) / 0.1)',
              color: trend.isPositive ? 'rgb(var(--color-success))' : 'rgb(var(--color-danger))'
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          {trend.durationLabel && (
            <span style={{ color: 'rgb(var(--color-text-secondary))' }} className="font-medium">
              {trend.durationLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
