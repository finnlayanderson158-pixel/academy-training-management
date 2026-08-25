import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { RIDE_ALONGS_REQUIRED, STANDARD_TRAININGS, type StandardTrainingKey } from '../types';

interface Props {
  onClose: () => void;
}

export default function UploadTrainingModal({ onClose }: Props) {
  const { state, auth, searchRecruits, createRecruitFromFto, logStandardTraining, logRideAlong } = useApp();

  const [query, setQuery] = useState('');
  const [selectedRecruitId, setSelectedRecruitId] = useState<string | null>(null);
  const [selectedFtoId, setSelectedFtoId] = useState<string>(auth.ftoId ?? '');
  const [trainingField, setTrainingField] = useState<StandardTrainingKey | 'rideAlong' | ''>('');
  const [showNotFound, setShowNotFound] = useState(false);
  const [saved, setSaved] = useState(false);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchRecruits(query).slice(0, 8);
  }, [query, state.recruits]);

  const selectedRecruit = state.recruits.find((r) => r.id === selectedRecruitId) ?? null;
  const selectedFto = state.ftos.find((f) => f.id === selectedFtoId) ?? null;

  function handleSearchChange(value: string) {
    setQuery(value);
    setSelectedRecruitId(null);
    setShowNotFound(false);
  }

  function handleSearchSubmit() {
    const exact = state.recruits.find((r) => r.name.trim().toLowerCase() === query.trim().toLowerCase());
    if (exact) {
      setSelectedRecruitId(exact.id);
      setShowNotFound(false);
    } else if (query.trim()) {
      setShowNotFound(true);
    }
  }

  function handleCreateRecruit() {
    const recruit = createRecruitFromFto(query.trim());
    setSelectedRecruitId(recruit.id);
    setShowNotFound(false);
  }

  function handleSave() {
    if (!selectedRecruit || !selectedFto || !trainingField) return;
    if (trainingField === 'rideAlong') {
      logRideAlong(selectedRecruit.id, selectedFto.id, selectedFto.name, 1);
    } else {
      logStandardTraining(selectedRecruit.id, trainingField, selectedFto.id, selectedFto.name);
    }
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-800">Upload Training</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-5 space-y-4">
          {saved ? (
            <div className="text-center py-10">
              <div className="text-emerald-600 text-4xl mb-2">✓</div>
              <div className="font-semibold text-slate-800">Training Saved</div>
              <div className="text-sm text-slate-500 mt-1">The spreadsheet has been updated.</div>
            </div>
          ) : (
            <>
              {/* Recruit search */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Recruit Name</label>
                <div className="flex gap-2">
                  <input
                    value={selectedRecruit ? selectedRecruit.name : query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    placeholder="Search or type recruit name..."
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {!selectedRecruit && (
                    <button
                      onClick={handleSearchSubmit}
                      className="px-3 py-2 bg-slate-800 text-white text-sm rounded-md hover:bg-slate-700"
                    >
                      Search
                    </button>
                  )}
                </div>

                {!selectedRecruit && matches.length > 0 && (
                  <div className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
                    {matches.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedRecruitId(r.id);
                          setShowNotFound(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 flex items-center justify-between"
                      >
                        <span>{r.name}</span>
                        {r.needsAdminInfo && (
                          <span className="text-[10px] text-amber-600 font-semibold">⚠ Missing Info</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedRecruit && (
                  <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                    <span className="text-sm text-emerald-800 font-medium">{selectedRecruit.name}</span>
                    <button
                      onClick={() => {
                        setSelectedRecruitId(null);
                        setQuery('');
                      }}
                      className="text-xs text-emerald-700 underline"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* FTO select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">FTO Name</label>
                <select
                  value={selectedFtoId}
                  onChange={(e) => setSelectedFtoId(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select FTO...</option>
                  {state.ftos
                    .filter((f) => f.active)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Training select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Training</label>
                <select
                  value={trainingField}
                  onChange={(e) => setTrainingField(e.target.value as StandardTrainingKey | 'rideAlong')}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select training...</option>
                  {STANDARD_TRAININGS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                  <option value="rideAlong">Ride Along (+1)</option>
                </select>
                {selectedRecruit && trainingField === 'rideAlong' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Current: {selectedRecruit.rideAlongs}/{RIDE_ALONGS_REQUIRED} → New:{' '}
                    {Math.min(RIDE_ALONGS_REQUIRED, selectedRecruit.rideAlongs + 1)}/{RIDE_ALONGS_REQUIRED}
                  </p>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={!selectedRecruit || !selectedFtoId || !trainingField}
                className="w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-md hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Save Training
              </button>
            </>
          )}
        </div>
      </div>

      {showNotFound && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-2">Recruit Not Found</h3>
            <p className="text-sm text-slate-600 mb-4">
              This recruit is not currently in the Academy roster. Would you like to create a training record for
              this recruit?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNotFound(false)}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecruit}
                className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Create Recruit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
