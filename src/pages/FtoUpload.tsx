import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { RIDE_ALONGS_REQUIRED, STANDARD_TRAININGS, type StandardTrainingKey } from '../types';
import PageHeader from '../components/PageHeader';

type Step = 'recruit' | 'fto' | 'training' | 'done';

export default function FtoUpload() {
  const { state, searchRecruits, searchFtos, createRecruitFromFto, addFto, logStandardTraining, logRideAlong } =
    useApp();

  const [step, setStep] = useState<Step>('recruit');
  const [query, setQuery] = useState('');
  const [selectedRecruitId, setSelectedRecruitId] = useState<string | null>(null);
  const [showNotFound, setShowNotFound] = useState(false);

  const [ftoQuery, setFtoQuery] = useState('');
  const [selectedFtoId, setSelectedFtoId] = useState<string>('');
  const [showFtoNotFound, setShowFtoNotFound] = useState(false);

  const [selectedTrainings, setSelectedTrainings] = useState<StandardTrainingKey[]>([]);
  const [rideAlongDelta, setRideAlongDelta] = useState(0);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchRecruits(query).slice(0, 8);
  }, [query, state.recruits]);

  const ftoMatches = useMemo(() => {
    if (!ftoQuery.trim()) return [];
    return searchFtos(ftoQuery).slice(0, 8);
  }, [ftoQuery, state.ftos]);

  const selectedRecruit = state.recruits.find((r) => r.id === selectedRecruitId) ?? null;
  const selectedFto = state.ftos.find((f) => f.id === selectedFtoId) ?? null;

  function handleSearchChange(value: string) {
    setQuery(value);
    setShowNotFound(false);
  }

  function handleSearchSubmit() {
    const exact = state.recruits.find((r) => r.name.trim().toLowerCase() === query.trim().toLowerCase());
    if (exact) {
      pickRecruit(exact.id);
    } else if (query.trim()) {
      setShowNotFound(true);
    }
  }

  function pickRecruit(id: string) {
    setSelectedRecruitId(id);
    setShowNotFound(false);
    setStep('fto');
  }

  function handleCreateRecruit() {
    const recruit = createRecruitFromFto(query.trim());
    pickRecruit(recruit.id);
  }

  function handleFtoSearchChange(value: string) {
    setFtoQuery(value);
    setShowFtoNotFound(false);
  }

  function handleFtoSearchSubmit() {
    const exact = state.ftos.find(
      (f) => f.active && f.name.trim().toLowerCase() === ftoQuery.trim().toLowerCase()
    );
    if (exact) {
      pickFto(exact.id);
    } else if (ftoQuery.trim()) {
      setShowFtoNotFound(true);
    }
  }

  function pickFto(id: string) {
    setSelectedFtoId(id);
    setShowFtoNotFound(false);
    setStep('training');
  }

  function handleCreateFto() {
    const fto = addFto(ftoQuery.trim());
    pickFto(fto.id);
  }

  function toggleTraining(field: StandardTrainingKey) {
    setSelectedTrainings((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  }

  function saveTraining() {
    if (!selectedRecruit || !selectedFto) return;
    for (const field of selectedTrainings) {
      logStandardTraining(selectedRecruit.id, field, selectedFto.id, selectedFto.name);
    }
    for (let i = 0; i < rideAlongDelta; i++) {
      logRideAlong(selectedRecruit.id, selectedFto.id, selectedFto.name, 1);
    }
    setStep('done');
  }

  function startOver() {
    setStep('recruit');
    setQuery('');
    setSelectedRecruitId(null);
    setShowNotFound(false);
    setFtoQuery('');
    setSelectedFtoId('');
    setShowFtoNotFound(false);
    setSelectedTrainings([]);
    setRideAlongDelta(0);
  }

  return (
    <div>
      <PageHeader title="FTO Training Upload" subtitle="Log training for a recruit" badge="FTO" badgeColor="bg-sky-600" />

      <div className="p-4 max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 text-xs font-semibold">
            <StepDot active={step === 'recruit'} done={step !== 'recruit'} label="1. Recruit" />
            <div className="flex-1 h-px bg-slate-200" />
            <StepDot active={step === 'fto'} done={step === 'training' || step === 'done'} label="2. Your Name" />
            <div className="flex-1 h-px bg-slate-200" />
            <StepDot active={step === 'training'} done={step === 'done'} label="3. Training" />
          </div>

          {step === 'recruit' && (
            <div className="space-y-3">
              <label className="block text-lg font-bold text-slate-800">Who did you train?</label>
              <input
                autoFocus
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Type recruit name..."
                className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-500"
              />

              {matches.length > 0 && (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {matches.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => pickRecruit(r.id)}
                      className="w-full text-left px-4 py-3 text-base hover:bg-sky-50 flex items-center justify-between"
                    >
                      <span className="font-medium">{r.name}</span>
                      {r.needsAdminInfo && <span className="text-[10px] text-amber-600 font-semibold">⚠ Missing Info</span>}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleSearchSubmit}
                disabled={!query.trim()}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg py-3 rounded-xl disabled:bg-slate-300"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'fto' && (
            <div className="space-y-3">
              <button onClick={() => setStep('recruit')} className="text-sm text-slate-400 hover:text-slate-600 mb-1">
                &larr; Back
              </button>
              <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-sm text-sky-800">
                Training: <strong>{selectedRecruit?.name}</strong>
              </div>
              <label className="block text-lg font-bold text-slate-800">Who are you?</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={ftoQuery}
                  onChange={(e) => handleFtoSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFtoSearchSubmit()}
                  placeholder="Type your name..."
                  className="flex-1 border-2 border-slate-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-sky-200 focus:border-sky-500"
                />
              </div>

              {ftoMatches.length > 0 && (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {ftoMatches.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => pickFto(f.id)}
                      className="w-full text-left px-4 py-3 text-base font-medium hover:bg-sky-50"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleFtoSearchSubmit}
                disabled={!ftoQuery.trim()}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg py-3 rounded-xl disabled:bg-slate-300"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'training' && selectedRecruit && (
            <div className="space-y-3">
              <button onClick={() => setStep('fto')} className="text-sm text-slate-400 hover:text-slate-600 mb-1">
                &larr; Back
              </button>
              <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 text-sm text-sky-800">
                {selectedRecruit.name} &middot; FTO: <strong>{selectedFto?.name}</strong>
              </div>
              <label className="block text-lg font-bold text-slate-800">
                What training did you complete? <span className="font-normal text-sm text-slate-400">(pick as many as you need)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STANDARD_TRAININGS.map((t) => {
                  const checked = selectedTrainings.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      onClick={() => toggleTraining(t.key)}
                      aria-pressed={checked}
                      className={`px-4 py-4 text-base font-semibold rounded-xl border-2 text-left flex items-center gap-2 ${
                        checked
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                          checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}
                      >
                        {checked ? '✓' : ''}
                      </span>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-orange-900">Ride Alongs</div>
                    <div className="text-xs text-orange-700">
                      Currently {selectedRecruit.rideAlongs}/{RIDE_ALONGS_REQUIRED}
                      {rideAlongDelta > 0 && (
                        <>
                          {' '}
                          &rarr; {Math.min(RIDE_ALONGS_REQUIRED, selectedRecruit.rideAlongs + rideAlongDelta)}/
                          {RIDE_ALONGS_REQUIRED} after saving
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRideAlongDelta((d) => Math.max(0, d - 1))}
                      disabled={rideAlongDelta === 0}
                      className="w-10 h-10 rounded-full border-2 border-orange-300 text-orange-700 font-bold text-xl flex items-center justify-center disabled:opacity-30"
                    >
                      &minus;
                    </button>
                    <span className="w-6 text-center font-bold text-orange-900 text-lg">{rideAlongDelta}</span>
                    <button
                      onClick={() => setRideAlongDelta((d) => Math.min(RIDE_ALONGS_REQUIRED - selectedRecruit.rideAlongs, d + 1))}
                      disabled={selectedRecruit.rideAlongs + rideAlongDelta >= RIDE_ALONGS_REQUIRED}
                      className="w-10 h-10 rounded-full border-2 border-orange-300 text-orange-700 font-bold text-xl flex items-center justify-center disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={saveTraining}
                disabled={selectedTrainings.length === 0 && rideAlongDelta === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-3 rounded-xl disabled:bg-slate-300"
              >
                Save Training
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-8 space-y-4">
              <div className="text-emerald-500 text-6xl">✓</div>
              <div className="text-xl font-bold text-slate-800">Training Saved!</div>
              <p className="text-slate-500">The roster has been updated.</p>
              <button
                onClick={startOver}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg px-6 py-3 rounded-xl"
              >
                Log Another Training
              </button>
            </div>
          )}
        </div>
      </div>

      {showNotFound && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Recruit Not Found</h3>
            <p className="text-sm text-slate-600 mb-5">
              "{query.trim()}" is not currently in the Academy roster. Would you like to create a training record for
              this recruit? A Supervisor can fill in the rest later.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNotFound(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecruit}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Create Recruit
              </button>
            </div>
          </div>
        </div>
      )}

      {showFtoNotFound && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">FTO Not Found</h3>
            <p className="text-sm text-slate-600 mb-5">
              "{ftoQuery.trim()}" is not currently listed as an FTO. Add yourself so this training can be logged
              under your name?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowFtoNotFound(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFto}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                Add Me as FTO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div
      className={`px-2 py-1 rounded-full whitespace-nowrap ${
        active
          ? 'bg-sky-600 text-white'
          : done
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-400'
      }`}
    >
      {label}
    </div>
  );
}
