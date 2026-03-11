import React from 'react';
import { History } from 'lucide-react';

function formatDateTime(value) {
  if (!value) {
    return 'Date inconnue';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export default function AdminActivityList({ title = 'Historique', items = [], emptyMessage = 'Aucune activité récente.' }) {
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">Suivi simple des dernières actions admin.</p>
        </div>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.summary}</p>
                  <p className="text-sm text-slate-500">
                    {item.admin_username} • {item.target_type}
                    {item.target_id ? ` • ${item.target_id}` : ''}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400">{formatDateTime(item.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-slate-500">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
