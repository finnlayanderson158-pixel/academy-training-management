import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AppState,
  FTO,
  Recruit,
  Role,
  StandardTrainingKey,
  TrainingHistoryEntry,
} from '../types';
import { RIDE_ALONGS_REQUIRED, STANDARD_TRAININGS } from '../types';
import { loadState, makeFto, makeRecruit, saveState, uid } from '../lib/storage';

interface AuthState {
  role: Role;
  ftoId: string | null; // when role === 'fto', which FTO is "logged in"
}

interface AppContextValue {
  state: AppState;
  auth: AuthState;
  setAuth: (auth: AuthState) => void;

  // Recruit lookups
  findRecruitByName: (name: string) => Recruit | undefined;
  searchRecruits: (query: string) => Recruit[];

  // FTO actions
  addFto: (name: string, discordUsername?: string) => void;
  updateFto: (id: string, patch: Partial<FTO>) => void;
  removeFto: (id: string) => void;

  // Recruit actions (admin)
  addRecruit: (data: {
    name: string;
    discordUsername: string;
    hiringDate: string;
    hiredBy: string;
  }) => void;
  updateRecruitAdmin: (id: string, patch: Partial<Recruit>, changedBy?: 'admin' | 'fto') => void;
  removeRecruit: (id: string) => void;

  // Training actions (FTO)
  createRecruitFromFto: (name: string) => Recruit;
  logStandardTraining: (recruitId: string, field: StandardTrainingKey, ftoId: string, ftoName: string) => void;
  logRideAlong: (recruitId: string, ftoId: string, ftoName: string, delta: 1 | -1) => void;

  historyForRecruit: (recruitId: string) => TrainingHistoryEntry[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const fieldLabels: Record<string, string> = {
  macrosTraining: 'Macros Training',
  taserTraining: 'Taser Training',
  drivingTest: 'Driving Test',
  shieldTraining: 'Shield Training',
  passive: 'Passive',
  aggressive: 'Aggressive',
  rideAlongs: 'Ride Alongs',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const [auth, setAuth] = useState<AuthState>({ role: 'admin', ftoId: null });

  useEffect(() => {
    saveState(state);
  }, [state]);

  function pushHistory(entry: Omit<TrainingHistoryEntry, 'id' | 'timestamp'>) {
    const full: TrainingHistoryEntry = {
      ...entry,
      id: uid(),
      timestamp: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, history: [full, ...prev.history] }));
  }

  const findRecruitByName = (name: string) =>
    state.recruits.find((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase());

  const searchRecruits = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return state.recruits;
    return state.recruits.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.discordUsername ?? '').toLowerCase().includes(q) ||
        (r.hiredBy ?? '').toLowerCase().includes(q)
    );
  };

  const addFto: AppContextValue['addFto'] = (name, discordUsername) => {
    setState((prev) => ({ ...prev, ftos: [...prev.ftos, makeFto(name, discordUsername)] }));
  };

  const updateFto: AppContextValue['updateFto'] = (id, patch) => {
    setState((prev) => ({
      ...prev,
      ftos: prev.ftos.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  };

  const removeFto: AppContextValue['removeFto'] = (id) => {
    setState((prev) => ({ ...prev, ftos: prev.ftos.filter((f) => f.id !== id) }));
  };

  const addRecruit: AppContextValue['addRecruit'] = (data) => {
    const recruit = makeRecruit({
      name: data.name,
      discordUsername: data.discordUsername || null,
      hiringDate: data.hiringDate || null,
      hiredBy: data.hiredBy || null,
      createdByFto: false,
      needsAdminInfo: false,
    });
    setState((prev) => ({ ...prev, recruits: [...prev.recruits, recruit] }));
  };

  function computeNeedsAdminInfo(r: Partial<Recruit>): boolean {
    return !r.discordUsername || !r.hiringDate || !r.hiredBy;
  }

  const updateRecruitAdmin: AppContextValue['updateRecruitAdmin'] = (id, patch, changedBy = 'admin') => {
    setState((prev) => ({
      ...prev,
      recruits: prev.recruits.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...patch, updatedAt: new Date().toISOString() };
        merged.needsAdminInfo = merged.createdByFto ? computeNeedsAdminInfo(merged) : false;
        return merged;
      }),
    }));

    // record history for standard/ride-along field edits made directly (admin cell edits)
    const recruit = state.recruits.find((r) => r.id === id);
    if (recruit) {
      for (const t of STANDARD_TRAININGS) {
        if (t.key in patch && patch[t.key] !== undefined && patch[t.key] !== recruit[t.key]) {
          pushHistory({
            recruitId: id,
            recruitName: recruit.name,
            ftoId: null,
            ftoName: changedBy === 'admin' ? 'Academy Admin' : 'FTO',
            field: t.key,
            fieldLabel: t.label,
            previousValue: recruit[t.key] ? 'Completed' : 'Not Completed',
            newValue: patch[t.key] ? 'Completed' : 'Not Completed',
            changedBy,
          });
        }
      }
      if (patch.rideAlongs !== undefined && patch.rideAlongs !== recruit.rideAlongs) {
        pushHistory({
          recruitId: id,
          recruitName: recruit.name,
          ftoId: null,
          ftoName: changedBy === 'admin' ? 'Academy Admin' : 'FTO',
          field: 'rideAlongs',
          fieldLabel: 'Ride Alongs',
          previousValue: `${recruit.rideAlongs}/${RIDE_ALONGS_REQUIRED}`,
          newValue: `${patch.rideAlongs}/${RIDE_ALONGS_REQUIRED}`,
          changedBy,
        });
      }
    }
  };

  const removeRecruit: AppContextValue['removeRecruit'] = (id) => {
    setState((prev) => ({ ...prev, recruits: prev.recruits.filter((r) => r.id !== id) }));
  };

  const createRecruitFromFto: AppContextValue['createRecruitFromFto'] = (name) => {
    const recruit = makeRecruit({
      name,
      createdByFto: true,
      needsAdminInfo: true,
    });
    setState((prev) => ({ ...prev, recruits: [...prev.recruits, recruit] }));
    return recruit;
  };

  const logStandardTraining: AppContextValue['logStandardTraining'] = (recruitId, field, ftoId, ftoName) => {
    const recruit = state.recruits.find((r) => r.id === recruitId);
    if (!recruit) return;
    const label = fieldLabels[field];
    const previousValue = recruit[field] ? 'Completed' : 'Not Completed';
    setState((prev) => ({
      ...prev,
      recruits: prev.recruits.map((r) =>
        r.id === recruitId ? { ...r, [field]: true, updatedAt: new Date().toISOString() } : r
      ),
    }));
    pushHistory({
      recruitId,
      recruitName: recruit.name,
      ftoId,
      ftoName,
      field,
      fieldLabel: label,
      previousValue,
      newValue: 'Completed',
      changedBy: 'fto',
    });
  };

  const logRideAlong: AppContextValue['logRideAlong'] = (recruitId, ftoId, ftoName, delta) => {
    const recruit = state.recruits.find((r) => r.id === recruitId);
    if (!recruit) return;
    const previous = recruit.rideAlongs;
    const next = Math.max(0, Math.min(RIDE_ALONGS_REQUIRED, previous + delta));
    if (next === previous) return;
    setState((prev) => ({
      ...prev,
      recruits: prev.recruits.map((r) =>
        r.id === recruitId ? { ...r, rideAlongs: next, updatedAt: new Date().toISOString() } : r
      ),
    }));
    pushHistory({
      recruitId,
      recruitName: recruit.name,
      ftoId,
      ftoName,
      field: 'rideAlongs',
      fieldLabel: 'Ride Alongs',
      previousValue: `${previous}/${RIDE_ALONGS_REQUIRED}`,
      newValue: `${next}/${RIDE_ALONGS_REQUIRED}`,
      changedBy: 'fto',
    });
  };

  const historyForRecruit: AppContextValue['historyForRecruit'] = (recruitId) =>
    state.history.filter((h) => h.recruitId === recruitId);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      auth,
      setAuth,
      findRecruitByName,
      searchRecruits,
      addFto,
      updateFto,
      removeFto,
      addRecruit,
      updateRecruitAdmin,
      removeRecruit,
      createRecruitFromFto,
      logStandardTraining,
      logRideAlong,
      historyForRecruit,
    }),
    [state, auth]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
