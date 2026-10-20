import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RIDE_ALONGS_REQUIRED, type Recruit } from '../types';
import { isRecruitComplete } from '../lib/recruitStatus';
import PageHeader from '../components/PageHeader';

type SortKey = 'name' | 'hiringDate' | 'rideAlongs';
type FilterKey = 'all' | 'active' | 'completed' | 'missingInfo' | 'incompleteTraining' | 'needsAdminInfo';
type ViewMode = 'cards' | 'table';

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

function getCompletedTrainingsCount(r: Recruit): number {
  let count = 0;
  if (r.macrosTraining) count++;
  if (r.taserTraining) count++;
  if (r.drivingTest) count++;
  if (r.shieldTraining) count++;
  if (r.passive) count++;
  if (r.aggressive) count++;
  if (r.rideAlongs >= RIDE_ALONGS_REQUIRED) count++;
  return count;
}

export default function Spreadsheet() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  // Default to cards on small screens, table on desktop
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  useEffect(() => {
    function handleResize() {
      // Optional resize sync if needed
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stats = useMemo(() => {
    const total = state.recruits.length;
    const completed = state.recruits.filter(isRecruitComplete).length;
    const inProgress = total - completed;
    const needsInfo = state.recruits.filter((r) => r.needsAdminInfo).length;
    return { total, completed, inProgress, needsInfo };
  }, [state.recruits]);

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

  return (
    <div>
      <PageHeader title="Academy Training Management" subtitle="Academy Roster (Read-Only)" />

      <div className="p-3 sm:p-5 max-w-[1600px] mx-auto space-y-4">
        {/* Header & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Academy Roster</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {filtered.length} of {state.recruits.length} recruits shown
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-md text-slate-300">
              Total: <strong className="text-white">{stats.total}</strong>
            </span>
            <span className="bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-md text-emerald-300">
              Completed: <strong className="text-emerald-400">{stats.completed}</strong>
            </span>
            <span className="bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-md text-amber-300">
              In Progress: <strong className="text-amber-400">{stats.inProgress}</strong>
            </span>
            {stats.needsInfo > 0 && (
              <span className="bg-red-950/40 border border-red-500/30 px-2.5 py-1 rounded-md text-red-300">
                ⚠ Missing Info: <strong className="text-red-400">{stats.needsInfo}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-3">
          {/* Top row: Search + View Mode Switcher */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recruit, Discord, hired by..."
                className="w-full border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-800 border border-slate-700 p-0.5 rounded-lg self-stretch sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📇</span> Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📊</span> Spreadsheet
              </button>
            </div>
          </div>

          {/* Bottom row: Filters & Sorting */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterKey)}
              className="col-span-2 sm:col-span-1 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="border border-slate-700 bg-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 sm:flex-initial"
            >
              <option value="name">Sort: Name</option>
              <option value="hiringDate">Sort: Hiring Date</option>
              <option value="rideAlongs">Sort: Ride Alongs</option>
            </select>

            <button
              onClick={() => setSortDir((d) => (d === 1 ? -1 : 1))}
              className="border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors"
              title="Toggle sort direction"
            >
              {sortDir === 1 ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Content View: Cards vs Spreadsheet */}
        {viewMode === 'cards' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((r) => (
                <RecruitCard key={r.id} recruit={r} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                <p className="text-base font-medium">No recruits match your search or filter.</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting the filter or clearing the search query.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Mobile Scroll Hint (visible on small/medium screens) */}
            <div className="block lg:hidden mb-1.5 text-[11px] text-slate-400 font-medium px-1 flex items-center justify-between">
              <span>← Swipe table horizontally to see all columns →</span>
              <span className="text-emerald-400 font-normal">Name column is frozen</span>
            </div>

            {/* Spreadsheet Table */}
            <div className="sheet-scroll overflow-auto rounded-lg border border-[#8fa085] shadow-xl max-h-[75vh]">
              <table className="border-collapse text-sm" style={{ minWidth: 1350 }}>
                <thead>
                  <tr>
                    {COLS.map((col) => (
                      <th
                        key={col.key}
                        onClick={() =>
                          col.key === 'name' || col.key === 'hiringDate' ? toggleSort(col.key as SortKey) : undefined
                        }
                        className={`bg-[#d7e4cf] text-[#2e3d27] font-bold text-xs uppercase tracking-wide border border-[#a9b8a0] px-2.5 py-2.5 text-left whitespace-nowrap ${
                          col.sticky ? 'sticky left-0 z-20 bg-[#c9dcc0] shadow-[2px_0_4px_rgba(0,0,0,0.06)]' : ''
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
          </div>
        )}

        {/* Legend */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-semibold text-slate-300">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-400 inline-block border border-emerald-600" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-200 inline-block border border-slate-400" /> Not Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm bg-orange-300 inline-block border border-orange-500" /> Ride Along Progress
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            ⚠ Missing Academy Information
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusCell({ done }: { done: boolean }) {
  return (
    <td
      className={`border border-[#c7d0c0] px-2 py-2 text-center font-bold ${
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
      className={`border border-[#c7d0c0] px-2 py-2 text-center font-bold ${
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
        className="sticky left-0 z-10 border border-[#c7d0c0] px-3 py-2 font-semibold text-slate-800 whitespace-nowrap shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
        style={{ background: zebra ? '#ffffff' : '#f4f7f1' }}
      >
        {recruit.name}
        {recruit.needsAdminInfo && (
          <span className="ml-2 text-[10px] text-amber-600 font-bold align-middle" title="Missing Academy Information">
            ⚠
          </span>
        )}
      </td>
      <td className="border border-[#c7d0c0] px-2.5 py-2 text-slate-700">
        {recruit.discordUsername ?? <span className="text-slate-400 italic">Not Added</span>}
      </td>
      <td className="border border-[#c7d0c0] px-2.5 py-2 text-slate-700">
        {recruit.hiringDate ?? <span className="text-slate-400 italic">Not Added</span>}
      </td>
      <td className="border border-[#c7d0c0] px-2.5 py-2 text-slate-700">
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

function RecruitCard({ recruit }: { recruit: Recruit }) {
  const complete = isRecruitComplete(recruit);
  const completedCount = getCompletedTrainingsCount(recruit);
  const percent = Math.round((completedCount / 7) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors space-y-3">
      {/* Top row: Name & Overall Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-base font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="truncate">{recruit.name}</span>
            {recruit.needsAdminInfo && (
              <span
                className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold"
                title="Missing Academy Information"
              >
                ⚠ Missing Info
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Discord: <span className="text-slate-200 font-mono">{recruit.discordUsername || 'Not Added'}</span>
          </div>
        </div>

        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
            complete
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          {complete ? '✓ Completed' : 'In Progress'}
        </span>
      </div>

      {/* Metadata info */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
        <div>
          <span className="text-slate-500 block text-[11px]">Hiring Date</span>
          <span className="font-medium text-slate-200 truncate block">
            {recruit.hiringDate || <span className="text-slate-500 italic">Not Added</span>}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Hired By</span>
          <span className="font-medium text-slate-200 truncate block">
            {recruit.hiredBy || <span className="text-slate-500 italic">Not Added</span>}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Overall Modules</span>
          <span className="font-medium text-slate-300">
            {completedCount}/7 ({percent}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              complete ? 'bg-emerald-500' : percent >= 50 ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Training badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
        <TrainingBadge label="Macros" done={recruit.macrosTraining} />
        <TrainingBadge label="Taser" done={recruit.taserTraining} />
        <TrainingBadge
          label={`Ride Alongs (${recruit.rideAlongs}/5)`}
          done={recruit.rideAlongs >= RIDE_ALONGS_REQUIRED}
          partial={recruit.rideAlongs > 0 && recruit.rideAlongs < RIDE_ALONGS_REQUIRED}
        />
        <TrainingBadge label="Driving Test" done={recruit.drivingTest} />
        <TrainingBadge label="Shield" done={recruit.shieldTraining} />
        <TrainingBadge label="Passive" done={recruit.passive} />
        <TrainingBadge label="Aggressive" done={recruit.aggressive} />
      </div>
    </div>
  );
}

function TrainingBadge({ label, done, partial }: { label: string; done: boolean; partial?: boolean }) {
  if (done) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-emerald-950/50 border border-emerald-600/30 text-emerald-300 text-xs font-medium">
        <span className="text-emerald-400 font-bold shrink-0">✓</span>
        <span className="truncate">{label}</span>
      </div>
    );
  }
  if (partial) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-orange-950/50 border border-orange-500/30 text-orange-300 text-xs font-medium">
        <span className="text-orange-400 font-bold shrink-0">⏳</span>
        <span className="truncate">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-800/40 border border-slate-700/40 text-slate-400 text-xs">
      <span className="text-slate-600 shrink-0">○</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
