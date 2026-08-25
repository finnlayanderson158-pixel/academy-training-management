import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { RIDE_ALONGS_REQUIRED, type Recruit } from '../types';
import UploadTrainingModal from '../components/UploadTrainingModal';
import { isRecruitComplete } from '../lib/recruitStatus';

type SortKey = 'name' | 'hiringDate' | 'rideAlongs';
type FilterKey = 'all' | 'active' | 'completed' | 'missingInfo' | 'incompleteTraining' | 'needsAdminInfo';

const COLS: { key: string; label: string; width: number; sticky?: boolean }[] = [
  { key: 'name', label: 'NAME', width: 180, sticky: true },
  { key: 'discordUsername', label: 'DISCORD USERNAME', width: 170 },
  { key: 'hiringDate', label: 'HIRING DATE', width: 130 },
  { key: 'hiredBy', label: 'HIRED BY', width: 150 },
  { key: 'macrosTraining', label: 'MACROS TRAINING', width: 130 },
  { key: 'taserTraining', label: 'TASER TRAINING', width: 130 },
  { key: 'rideAlongs', label: 'RIDE ALONGS', width: 120 },
  { key: 'drivingTest', label: 'DRIVING TEST', width: 120 },
  { key: 'shieldTraining', label: 'SHIELD TRAINING', width: 130 },
  { key: 'passive', label: 'PASSIVE', width: 100 },
  { key: 'aggressive', label: 'AGGRESSIVE', width: 110 },
] as const;

export default function Spreadsheet() {
  const { state, auth } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...state.recruits];

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.discordUsername ?? '').toLowerCase().includes(q) ||
          (r.hiredBy ?? '').toLowerCase().includes(q)
      );
    }

    switch (filter) {
      case 'active':
        rows = rows.filter((r) => !isRecruitComplete(r));
        break;
      case 'completed':
        rows = rows.filter(isRecruitComplete);
        break;
      case 'missingInfo':
        rows = rows.filter((r) => !r.discordUsername || !r.hiringDate || !r.hiredBy);
        break;
      case 'incompleteTraining':
        rows = rows.filter((r) => !isRecruitComplete(r));
        break;
      case 'needsAdminInfo':
        rows = rows.filter((r) => r.needsAdminInfo);
        break;
    }

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'hiringDate') cmp = (a.hiringDate ?? '').localeCompare(b.hiringDate ?? '');
      else if (sortKey === 'rideAlongs') cmp = a.rideAlongs - b.rideAlongs;
      return cmp * sortDir;
    });

    return rows;
  }, [state.recruits, search, filter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const canUpload = auth.role === 'fto' || auth.role === 'admin';

  return (
    <div className="p-4 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Academy Roster</h1>
          <p className="text-sm text-slate-400">
            {filtered.length} recruit{filtered.length !== 1 ? 's' : ''} shown &middot; {state.recruits.length} total
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setUploadOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-md text-sm shadow"
          >
            + Upload Training
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, Discord, or hired by..."
          className="border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-md px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterKey)}
          className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-2 py-2 text-sm"
        >
          <option value="all">All Recruits</option>
          <option value="active">Active (Incomplete)</option>
          <option value="completed">Completed Recruits</option>
          <option value="missingInfo">Missing Information</option>
          <option value="incompleteTraining">Training Incomplete</option>
          <option value="needsAdminInfo">Needs Admin Information</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => toggleSort(e.target.value as SortKey)}
          className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-2 py-2 text-sm"
        >
          <option value="name">Sort: Name</option>
          <option value="hiringDate">Sort: Hiring Date</option>
          <option value="rideAlongs">Sort: Ride Alongs</option>
        </select>
        <button
          onClick={() => setSortDir((d) => (d === 1 ? -1 : 1))}
          className="border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-2 py-2 text-sm"
          title="Toggle sort direction"
        >
          {sortDir === 1 ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {/* Spreadsheet */}
      <div className="sheet-scroll overflow-auto rounded-md border border-[#8fa085] shadow-xl max-h-[75vh]">
        <table className="border-collapse text-sm" style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => (col.key === 'name' || col.key === 'hiringDate' ? toggleSort(col.key as SortKey) : undefined)}
                  className={`bg-[#d7e4cf] text-[#2e3d27] font-bold text-xs uppercase tracking-wide border border-[#a9b8a0] px-2 py-2 text-left whitespace-nowrap ${
                    col.sticky ? 'sticky left-0 z-20 bg-[#c9dcc0]' : ''
                  } ${col.key === 'name' || col.key === 'hiringDate' ? 'cursor-pointer select-none' : ''}`}
                  style={{ minWidth: col.width, position: col.sticky ? 'sticky' : undefined, top: 0 }}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <RecruitRow key={r.id} recruit={r} zebra={idx % 2 === 0} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="text-center py-8 text-slate-500 bg-white">
                  No recruits match your search/filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block border border-emerald-600" /> Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block border border-slate-400" /> Not Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-orange-300 inline-block border border-orange-500" /> Ride Along Progress
        </span>
        <span className="flex items-center gap-1 text-amber-400 font-medium">⚠ Missing Academy Information</span>
      </div>

      {uploadOpen && <UploadTrainingModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}

function StatusCell({ done }: { done: boolean }) {
  return (
    <td
      className={`border border-[#c7d0c0] px-2 py-2 text-center font-semibold ${
        done ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {done ? 'Y' : ''}
    </td>
  );
}

function RideAlongCell({ count }: { count: number }) {
  const complete = count >= RIDE_ALONGS_REQUIRED;
  return (
    <td
      className={`border border-[#c7d0c0] px-2 py-2 text-center font-semibold ${
        complete ? 'bg-emerald-200 text-emerald-900' : count > 0 ? 'bg-orange-200 text-orange-900' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {count}/{RIDE_ALONGS_REQUIRED}
    </td>
  );
}

function RecruitRow({ recruit, zebra }: { recruit: Recruit; zebra: boolean }) {
  return (
    <tr className={zebra ? 'bg-white' : 'bg-[#f4f7f1]'}>
      <td
        className="sticky left-0 z-10 border border-[#c7d0c0] px-2 py-2 font-semibold text-slate-800 whitespace-nowrap"
        style={{ background: zebra ? '#ffffff' : '#f4f7f1' }}
      >
        {recruit.name}
        {recruit.needsAdminInfo && (
          <span className="ml-2 text-[10px] text-amber-600 font-bold align-middle" title="Missing Academy Information">
            ⚠
          </span>
        )}
      </td>
      <td className="border border-[#c7d0c0] px-2 py-2 text-slate-700">
        {recruit.discordUsername ?? <span className="text-slate-400 italic">Not Added</span>}
      </td>
      <td className="border border-[#c7d0c0] px-2 py-2 text-slate-700">
        {recruit.hiringDate ?? <span className="text-slate-400 italic">Not Added</span>}
      </td>
      <td className="border border-[#c7d0c0] px-2 py-2 text-slate-700">
        {recruit.hiredBy ?? <span className="text-slate-400 italic">Not Added</span>}
      </td>
      <StatusCell done={recruit.macrosTraining} />
      <StatusCell done={recruit.taserTraining} />
      <RideAlongCell count={recruit.rideAlongs} />
      <StatusCell done={recruit.drivingTest} />
      <StatusCell done={recruit.shieldTraining} />
      <StatusCell done={recruit.passive} />
      <StatusCell done={recruit.aggressive} />
    </tr>
  );
}

