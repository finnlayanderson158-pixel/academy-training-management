import type { AppState, FTO, Recruit } from '../types';

const STORAGE_KEY = 'academy-training-state-v1';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function makeRecruit(partial: Partial<Recruit> & { name: string }): Recruit {
  const now = new Date().toISOString();
  return {
    id: uid(),
    discordUsername: null,
    hiringDate: null,
    hiredBy: null,
    macrosTraining: false,
    taserTraining: false,
    rideAlongs: 0,
    drivingTest: false,
    shieldTraining: false,
    passive: false,
    aggressive: false,
    createdByFto: false,
    needsAdminInfo: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

function makeFto(name: string, discordUsername?: string): FTO {
  return {
    id: uid(),
    name,
    discordUsername,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

function seedState(): AppState {
  const ftos: FTO[] = [
    makeFto('Finnlay Anderson', 'finnlay.a'),
    makeFto('Professor Hulk', 'prof.hulk'),
    makeFto('Kaci Unique', 'kaci.unique'),
    makeFto('Tia Winters', 'tiawinters'),
  ];

  const recruits: Recruit[] = [
    makeRecruit({
      name: 'John Smith',
      discordUsername: 'johnsmith22',
      hiringDate: '2026-07-01',
      hiredBy: 'Professor Hulk',
      macrosTraining: true,
      taserTraining: true,
      rideAlongs: 5,
      drivingTest: true,
      shieldTraining: true,
      passive: true,
      aggressive: false,
    }),
    makeRecruit({
      name: 'Alex Johnson',
      discordUsername: 'alexj',
      hiringDate: '2026-07-15',
      hiredBy: 'Kaci Unique',
      macrosTraining: true,
      taserTraining: false,
      rideAlongs: 3,
      drivingTest: false,
      shieldTraining: false,
      passive: false,
      aggressive: false,
    }),
    makeRecruit({
      name: 'Michael Brown',
      discordUsername: 'mbrown',
      hiringDate: '2026-08-01',
      hiredBy: 'Tia Winters',
      macrosTraining: false,
      taserTraining: false,
      rideAlongs: 0,
      drivingTest: false,
      shieldTraining: false,
      passive: false,
      aggressive: false,
    }),
    makeRecruit({
      name: 'Rise Up',
      discordUsername: null,
      hiringDate: null,
      hiredBy: null,
      macrosTraining: true,
      taserTraining: true,
      rideAlongs: 2,
      drivingTest: false,
      shieldTraining: false,
      passive: false,
      aggressive: false,
      createdByFto: true,
      needsAdminInfo: true,
    }),
  ];

  return { recruits, ftos, history: [] };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedState();
      saveState(seeded);
      return seeded;
    }
    return JSON.parse(raw) as AppState;
  } catch {
    const seeded = seedState();
    saveState(seeded);
    return seeded;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export { uid, makeRecruit, makeFto };
