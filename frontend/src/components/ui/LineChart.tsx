import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, height = 300 }) => {
  const [themeColors, setThemeColors] = useState({
    bg: '#FFF', border: '#E5E7EB', text: '#6B7280', accent: '#3B82F6'
  });

  useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    setThemeColors({
      bg: `rgb(${rootStyle.getPropertyValue('--color-surface').trim() || '255 255 255'})`,
      border: `rgb(${rootStyle.getPropertyValue('--color-border').trim() || '229 231 235'})`,
      text: `rgb(${rootStyle.getPropertyValue('--color-text-secondary').trim() || '107 114 128'})`,
      accent: `rgb(${rootStyle.getPropertyValue('--color-accent').trim() || '59 130 246'})`,
    });
  }, [data]); // Reload paths if theme shifts or dependencies cycle

  const chartData = data.length === 1 ? [data[0], { label: '', value: data[0].value }] : data;

  return (
    <div 
      style={{ width: '100%', height, backgroundColor: themeColors.bg, borderColor: themeColors.border }} 
      className="p-4 border rounded-2xl shadow-sm transition-colors"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            contentStyle={{ backgroundColor: themeColors.bg, borderRadius: '12px', borderColor: themeColors.border }}
            itemStyle={{ color: themeColors.accent, fontWeight: 600 }}
            labelStyle={{ color: themeColors.text, fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={themeColors.accent} 
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, stroke: themeColors.accent, fill: themeColors.bg }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
