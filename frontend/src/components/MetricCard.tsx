import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string | null;
  icon?: React.ReactNode;
}

export default function MetricCard({ title, value, subtext, icon }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-xs text-amber-600 mt-1 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}