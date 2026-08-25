import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import AddRecruitModal from '../components/AddRecruitModal';
import EditRecruitModal from '../components/EditRecruitModal';
import FtoManager from '../components/FtoManager';
import TrainingHistoryPanel from '../components/TrainingHistoryPanel';
import { isRecruitComplete } from '../lib/recruitStatus';

export default function Admin() {
  const { state, auth } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const editing = state.recruits.find((r) => r.id === editingId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.recruits;
    return state.recruits.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.discordUsername ?? '').toLowerCase().includes(q)
    );
  }, [state.recruits, search]);

  const needsInfoCount = state.recruits.filter((r) => r.needsAdminInfo).length;

  if (auth.role !== 'admin') {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="text-3xl mb-2">🔒</div>
        <h1 className="text-lg font-semibold text-slate-100 mb-1">Academy Leadership Only</h1>
        <p className="text-sm text-slate-400">
          Switch your role to "Academy Supervisor / Admin" in the top navigation to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Academy Leadership Admin Panel</h1>
          <p className="text-sm text-slate-400">
            {state.recruits.length} recruits &middot; {state.ftos.length} FTOs
            {needsInfoCount > 0 && (
              <span className="text-amber-400 font-medium"> &middot; {needsInfoCount} need admin information</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-md text-sm shadow"
        >
          + Add Recruit
        </button>
      </div>

      {/* Recruit management table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-semibold text-slate-100">Recruit Management</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recruits..."
            className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-3 py-1.5 text-sm w-64"
          />
        </div>

        <div className="overflow-auto max-h-[420px] border border-slate-800 rounded-md">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-800 text-slate-300 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Discord</th>
                <th className="px-3 py-2 text-left">Hiring Date</th>
                <th className="px-3 py-2 text-left">Hired By</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Ride Alongs</th>
                <th className="px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-800 text-slate-300">
                  <td className="px-3 py-2 font-medium text-slate-100">
                    {r.name}
                    {r.needsAdminInfo && <span className="ml-2 text-amber-400 text-xs">⚠ Missing Info</span>}
                  </td>
                  <td className="px-3 py-2">{r.discordUsername ?? <span className="text-slate-500 italic">Not Added</span>}</td>
                  <td className="px-3 py-2">{r.hiringDate ?? <span className="text-slate-500 italic">Not Added</span>}</td>
                  <td className="px-3 py-2">{r.hiredBy ?? <span className="text-slate-500 italic">Not Added</span>}</td>
                  <td className="px-3 py-2">
                    {isRecruitComplete(r) ? (
                      <span className="text-emerald-400 font-medium">Completed</span>
                    ) : (
                      <span className="text-slate-400">In Progress</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{r.rideAlongs}/5</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setEditingId(r.id)}
                      className="text-xs px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-500">
                    No recruits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FtoManager />

      <TrainingHistoryPanel />

      {addOpen && <AddRecruitModal onClose={() => setAddOpen(false)} />}
      {editing && <EditRecruitModal recruit={editing} onClose={() => setEditingId(null)} />}
    </div>
  );
}
