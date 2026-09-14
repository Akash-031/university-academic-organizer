import React from 'react';

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      badge: 'bg-blue-100 text-blue-700',
      accent: 'group-hover:border-blue-300'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
      badge: 'bg-purple-100 text-purple-700',
      accent: 'group-hover:border-purple-300'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-700',
      accent: 'group-hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      badge: 'bg-amber-100 text-amber-700',
      accent: 'group-hover:border-amber-300'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      badge: 'bg-rose-100 text-rose-700',
      accent: 'group-hover:border-rose-300'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } group ${scheme.accent}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${scheme.badge}`}>
                {trend}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.border} border transition-transform duration-200 group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
