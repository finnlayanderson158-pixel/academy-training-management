import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RIDE_ALONGS_REQUIRED, STANDARD_TRAININGS, type Recruit } from '../types';

export default function EditRecruitModal({ recruit, onClose }: { recruit: Recruit; onClose: () => void }) {
  const { updateRecruitAdmin, removeRecruit, historyForRecruit } = useApp();
  const [name, setName] = useState(recruit.name);
  const [discordUsername, setDiscordUsername] = useState(recruit.discordUsername ?? '');
  const [hiringDate, setHiringDate] = useState(recruit.hiringDate ?? '');
  const [hiredBy, setHiredBy] = useState(recruit.hiredBy ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const history = historyForRecruit(recruit.id);

  function handleSave() {
    updateRecruitAdmin(recruit.id, {
      name: name.trim() || recruit.name,
      discordUsername: discordUsername.trim() || null,
      hiringDate: hiringDate.trim() || null,
      hiredBy: hiredBy.trim() || null,
    });
    onClose();
  }

  function toggleTraining(key: (typeof STANDARD_TRAININGS)[number]['key']) {
    updateRecruitAdmin(recruit.id, { [key]: !recruit[key] } as Partial<Recruit>);
  }

  function setRideAlongs(n: number) {
    updateRecruitAdmin(recruit.id, { rideAlongs: Math.max(0, Math.min(RIDE_ALONGS_REQUIRED, n)) });
  }

  function handleDelete() {
    removeRecruit(recruit.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-800">Edit Recruit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-5 space-y-5">
          {recruit.needsAdminInfo && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 text-sm rounded-md px-3 py-2">
              ⚠ This recruit was created by an FTO and is missing Academy information. Complete the fields below.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Discord Username</label>
              <input
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="Not Added"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hiring Date</label>
              <input
                type="date"
                value={hiringDate}
                onChange={(e) => setHiringDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hired By</label>
              <input
                value={hiredBy}
                onChange={(e) => setHiredBy(e.target.value)}
                placeholder="Not Added"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Training Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STANDARD_TRAININGS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => toggleTraining(t.key)}
                  className={`px-3 py-2 rounded-md text-xs font-semibold border ${
                    recruit[t.key]
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}
                >
                  {t.label}: {recruit[t.key] ? 'Completed' : 'Not Completed'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
              Ride Alongs ({recruit.rideAlongs}/{RIDE_ALONGS_REQUIRED})
            </label>
            <div className="flex gap-1">
              {Array.from({ length: RIDE_ALONGS_REQUIRED + 1 }, (_, n) => (
                <button
                  key={n}
                  onClick={() => setRideAlongs(n)}
                  className={`w-10 h-10 rounded-md text-sm font-semibold border ${
                    recruit.rideAlongs === n
                      ? 'bg-orange-300 border-orange-500 text-orange-900'
                      : 'bg-slate-100 border-slate-300 text-slate-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Recent History</label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
                {history.slice(0, 10).map((h) => (
                  <div key={h.id} className="px-3 py-2 text-xs text-slate-600 flex justify-between">
                    <span>
                      <strong>{h.fieldLabel}</strong> {h.previousValue} → {h.newValue} by {h.ftoName}
                    </span>
                    <span className="text-slate-400">{new Date(h.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 flex-wrap gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-red-600">Remove this recruit permanently?</span>
                <button onClick={handleDelete} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold">
                  Confirm Delete
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-md border border-slate-300 text-xs">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-red-600 text-xs font-semibold hover:underline">
                Remove Recruit
              </button>
            )}
            <button onClick={handleSave} className="bg-emerald-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-emerald-700 text-sm">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
