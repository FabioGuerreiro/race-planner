/** Broad ownership/scope classification for a race circuit. */
export type CircuitType = 'regional' | 'national' | 'private';

/** A season-based trail circuit that can include many races. */
export interface Circuit {
  id: string;
  name: string;
  type: CircuitType;
  season: string;
  website?: string;
}
