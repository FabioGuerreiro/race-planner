/** Publication state for a race in the frontend calendar. */
export type RaceStatus = 'announced' | 'confirmed' | 'cancelled' | 'completed';

/** Core race information loaded from the public mock calendar data. */
export interface Race {
  id: string;
  name: string;
  date: Date;
  location: string;
  district: string;
  municipality: string;
  organizer: string;
  registrationUrl?: string;
  officialUrl?: string;
  status: RaceStatus;
}
