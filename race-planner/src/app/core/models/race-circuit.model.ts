/** Join record connecting races to circuits for a given season. */
export interface RaceCircuit {
  raceId: string;
  circuitId: string;
  season: string;
  category?: string;
}
