import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 300 }) => {
  const [themeColors, setThemeColors] = useState({
    bg: '#FFF', border: '#E5E7EB', text: '#6B7280', success: '#22C55E'
  });

  useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    setThemeColors({
      bg: `rgb(${rootStyle.getPropertyValue('--color-surface').trim() || '255 255 255'})`,
      border: `rgb(${rootStyle.getPropertyValue('--color-border').trim() || '229 231 235'})`,
      text: `rgb(${rootStyle.getPropertyValue('--color-text-secondary').trim() || '107 114 128'})`,
      success: `rgb(${rootStyle.getPropertyValue('--color-success').trim() || '34 197 94'})`,
    });
  }, [data]);

  return (
    <div 
      style={{ width: '100%', height, backgroundColor: themeColors.bg, borderColor: themeColors.border }} 
      className="p-4 border rounded-2xl shadow-sm transition-colors"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={themeColors.border} />
          <XAxis 
            dataKey="label" 
            tick={{ fill: themeColors.text, fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: themeColors.text, fontSize: 12, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgb(var(--color-surface-alt) / 0.4)' }}
            contentStyle={{ backgroundColor: themeColors.bg, borderRadius: '12px', borderColor: themeColors.border }}
            itemStyle={{ color: themeColors.success, fontWeight: 600 }}
            labelStyle={{ color: themeColors.text, fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}
          />
          <Bar 
            dataKey="value" 
            fill={themeColors.success} 
            radius={[4, 4, 0, 0]} 
            maxBarSize={48}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
