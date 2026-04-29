/** Distance category used for filtering and compact display in the race calendar. */
export type RaceDistanceCategory = 'UTE' | 'UT' | 'TL' | 'TC' | 'MINI' | 'OTHER';

/** A published distance option within a race, such as a short trail or ultra route. */
export interface RaceDistance {
  id: string;
  raceId: string;
  name: string;
  distanceKm: number;
  elevationGainM: number;
  category: RaceDistanceCategory;
  atrpCategory?: string;
}
