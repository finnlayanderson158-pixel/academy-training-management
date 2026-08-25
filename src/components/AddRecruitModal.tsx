import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AddRecruitModal({ onClose }: { onClose: () => void }) {
  const { addRecruit } = useApp();
  const [name, setName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [hiringDate, setHiringDate] = useState('');
  const [hiredBy, setHiredBy] = useState('');

  function handleSubmit() {
    if (!name.trim()) return;
    addRecruit({ name: name.trim(), discordUsername, hiringDate, hiredBy });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-800">Recruit Intake</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="Recruit name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Discord Username</label>
            <input
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="discord.username"
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
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="Who hired this recruit"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-md hover:bg-emerald-700 disabled:bg-slate-300"
          >
            Add Recruit
          </button>
        </div>
      </div>
    </div>
  );
}
