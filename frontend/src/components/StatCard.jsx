import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'brand'
}) {
  const colorStyles = {
    brand: {
      bg: 'bg-brand-50',
      text: 'text-brand-600',
      border: 'border-brand-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    }
  };

  const currentStyle = colorStyles[color] || colorStyles.brand;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {value !== undefined ? value : '--'}
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-1.5">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${currentStyle.bg} ${currentStyle.text} border ${currentStyle.border} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
