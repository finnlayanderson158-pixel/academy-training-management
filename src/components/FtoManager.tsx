import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function FtoManager() {
  const { state, addFto, updateFto, removeFto } = useApp();
  const [name, setName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    addFto(name.trim(), discordUsername.trim() || undefined);
    setName('');
    setDiscordUsername('');
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h2 className="font-semibold text-slate-100 mb-3">FTO Management</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="FTO name"
          className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-3 py-2 text-sm flex-1 min-w-[160px]"
        />
        <input
          value={discordUsername}
          onChange={(e) => setDiscordUsername(e.target.value)}
          placeholder="Discord username (optional)"
          className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-3 py-2 text-sm flex-1 min-w-[160px]"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:bg-slate-700"
        >
          + Add FTO
        </button>
      </div>

      <div className="divide-y divide-slate-800">
        {state.ftos.map((f) => {
          const trainingCount = state.history.filter((h) => h.ftoId === f.id).length;
          return (
            <div key={f.id} className="py-2 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-slate-100 font-medium text-sm">
                  {f.name}{' '}
                  {!f.active && <span className="text-xs text-slate-500 font-normal">(inactive)</span>}
                </div>
                <div className="text-xs text-slate-500">
                  {f.discordUsername ?? 'No Discord set'} &middot; {trainingCount} training log
                  {trainingCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateFto(f.id, { active: !f.active })}
                  className="text-xs px-2 py-1 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  {f.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => removeFto(f.id)}
                  className="text-xs px-2 py-1 rounded-md border border-red-800 text-red-400 hover:bg-red-950"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
        {state.ftos.length === 0 && <div className="text-sm text-slate-500 py-3">No FTOs added yet.</div>}
      </div>
    </div>
  );
}
