export type Role = 'fto' | 'admin';

export type StandardTrainingKey =
  | 'macrosTraining'
  | 'taserTraining'
  | 'drivingTest'
  | 'shieldTraining'
  | 'passive'
  | 'aggressive';

export const STANDARD_TRAININGS: { key: StandardTrainingKey; label: string }[] = [
  { key: 'macrosTraining', label: 'Macros Training' },
  { key: 'taserTraining', label: 'Taser Training' },
  { key: 'drivingTest', label: 'Driving Test' },
  { key: 'shieldTraining', label: 'Shield Training' },
  { key: 'passive', label: 'Passive' },
  { key: 'aggressive', label: 'Aggressive' },
];

export const RIDE_ALONGS_REQUIRED = 5;

export interface FTO {
  id: string;
  name: string;
  discordUsername?: string;
  active: boolean;
  createdAt: string;
}

export interface Recruit {
  id: string;
  name: string;
  discordUsername: string | null; // null = "Not Added"
  hiringDate: string | null; // null = "Not Added"
  hiredBy: string | null; // null = "Not Added"
  macrosTraining: boolean;
  taserTraining: boolean;
  rideAlongs: number; // 0-5
  drivingTest: boolean;
  shieldTraining: boolean;
  passive: boolean;
  aggressive: boolean;
  createdByFto: boolean; // true if auto-created by an FTO, not the admin
  needsAdminInfo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TrainingFieldKey = StandardTrainingKey | 'rideAlongs';

export interface TrainingHistoryEntry {
  id: string;
  recruitId: string;
  recruitName: string;
  ftoId: string | null;
  ftoName: string;
  field: TrainingFieldKey;
  fieldLabel: string;
  previousValue: string;
  newValue: string;
  timestamp: string;
  changedBy: 'fto' | 'admin';
}

export interface AppState {
  recruits: Recruit[];
  ftos: FTO[];
  history: TrainingHistoryEntry[];
}
