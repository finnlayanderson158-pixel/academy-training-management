import { RIDE_ALONGS_REQUIRED, type Recruit } from '../types';

export function isRecruitComplete(r: Recruit): boolean {
  return (
    r.macrosTraining &&
    r.taserTraining &&
    r.drivingTest &&
    r.shieldTraining &&
    r.passive &&
    r.aggressive &&
    r.rideAlongs >= RIDE_ALONGS_REQUIRED
  );
}
