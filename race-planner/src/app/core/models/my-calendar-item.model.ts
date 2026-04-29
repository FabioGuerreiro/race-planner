/** User planning priority for a race distance. */
export type RacePriority = 'A' | 'B' | 'C';

/** User intent for including a race distance in their calendar. */
export type RaceIntention = 'compete' | 'train' | 'maybe' | 'skip';

/** User-specific calendar entry for one selected race distance. */
export interface MyCalendarItem {
  id: string;
  raceId: string;
  distanceId: string;
  priority: RacePriority;
  intention: RaceIntention;
  notes?: string;
}
