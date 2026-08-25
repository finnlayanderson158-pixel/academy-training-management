import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function TrainingHistoryPanel() {
  const { state } = useApp();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.history;
    return state.history.filter(
      (h) =>
        h.recruitName.toLowerCase().includes(q) ||
        h.ftoName.toLowerCase().includes(q) ||
        h.fieldLabel.toLowerCase().includes(q)
    );
  }, [state.history, query]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-semibold text-slate-100">Training History</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by recruit, FTO, or training..."
          className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-3 py-1.5 text-sm w-72"
        />
      </div>

      <div className="overflow-auto max-h-[420px] border border-slate-800 rounded-md">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800 text-slate-300 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Recruit</th>
              <th className="px-3 py-2 text-left">FTO</th>
              <th className="px-3 py-2 text-left">Training</th>
              <th className="px-3 py-2 text-left">Previous</th>
              <th className="px-3 py-2 text-left">New</th>
              <th className="px-3 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.id} className="border-t border-slate-800 text-slate-300">
                <td className="px-3 py-2 font-medium text-slate-100">{h.recruitName}</td>
                <td className="px-3 py-2">{h.ftoName}</td>
                <td className="px-3 py-2">{h.fieldLabel}</td>
                <td className="px-3 py-2 text-slate-500">{h.previousValue}</td>
                <td className="px-3 py-2 text-emerald-400">{h.newValue}</td>
                <td className="px-3 py-2 text-slate-500">{new Date(h.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-500">
                  No training history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
