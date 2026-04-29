import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { Circuit } from '../models/circuit.model';
import { RaceCircuit } from '../models/race-circuit.model';
import { RaceDistance, RaceDistanceCategory } from '../models/race-distance.model';
import { Race, RaceStatus } from '../models/race.model';

/** Raw race shape from mock JSON before date conversion and joins. */
interface RaceDto {
  id: string;
  name: string;
  date: string;
  location: string;
  district: string;
  municipality: string;
  organizer: string;
  registrationUrl?: string;
  officialUrl?: string;
  status: RaceStatus;
}

/** Raw distance shape from mock JSON before category normalization. */
interface RaceDistanceDto {
  id: string;
  raceId: string;
  name: string;
  distanceKm: number;
  elevationGainM: number;
  atrpCategory?: string;
}

/** Race view model enriched with distances and many-to-many circuit membership. */
export interface RaceWithDistances extends Race {
  distances: RaceDistance[];
  circuits: Circuit[];
}

@Injectable({
  providedIn: 'root',
})
export class RaceService {
  private readonly http = inject(HttpClient);
  private readonly racesUrl = '/races-dummy.json';
  private readonly raceDistancesUrl = '/races-distances-dummy.json';
  private readonly circuitsUrl = '/circuits-dummy.json';
  private readonly raceCircuitsUrl = '/race-circuits-dummy.json';

  /** Loads the frontend MVP race calendar and resolves its mock data relationships. */
  getRaces(): Observable<RaceWithDistances[]> {
    return forkJoin({
      races: this.http.get<RaceDto[]>(this.racesUrl),
      distances: this.http.get<RaceDistanceDto[]>(this.raceDistancesUrl),
      circuits: this.http.get<Circuit[]>(this.circuitsUrl),
      raceCircuits: this.http.get<RaceCircuit[]>(this.raceCircuitsUrl),
    }).pipe(
      map(({ races, distances, circuits, raceCircuits }) => {
        const circuitsById = circuits.reduce<Record<string, Circuit>>((groups, circuit) => {
          groups[circuit.id] = circuit;
          return groups;
        }, {});

        const circuitIdsByRaceId = raceCircuits.reduce<Record<string, string[]>>((groups, raceCircuit) => {
          groups[raceCircuit.raceId] = [...(groups[raceCircuit.raceId] ?? []), raceCircuit.circuitId];
          return groups;
        }, {});

        const distancesByRaceId = distances
          .map((distance) => this.toRaceDistance(distance))
          .reduce<Record<string, RaceDistance[]>>((groups, distance) => {
            groups[distance.raceId] = [...(groups[distance.raceId] ?? []), distance];
            return groups;
          }, {});

        return races
          .map((race) => ({
            ...race,
            date: new Date(race.date),
            circuits: (circuitIdsByRaceId[race.id] ?? [])
              .map((circuitId) => circuitsById[circuitId])
              .filter((circuit): circuit is Circuit => Boolean(circuit)),
            distances: (distancesByRaceId[race.id] ?? []).sort(
              (first, second) => first.distanceKm - second.distanceKm,
            ),
          }))
          .sort((first, second) => first.date.getTime() - second.date.getTime());
      }),
    );
  }

  /** Loads available circuits from mock data for filtering and admin assignment. */
  getCircuits(): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(this.circuitsUrl);
  }

  /** Loads race-to-circuit join records used by the admin association workflow. */
  getRaceCircuits(): Observable<RaceCircuit[]> {
    return this.http.get<RaceCircuit[]>(this.raceCircuitsUrl);
  }

  private toRaceDistance(distance: RaceDistanceDto): RaceDistance {
    return {
      ...distance,
      category: this.normalizeDistanceCategory(distance),
    };
  }

  private normalizeDistanceCategory(distance: RaceDistanceDto): RaceDistanceCategory {
    const rawCategory = distance.atrpCategory?.trim().toUpperCase();

    // Explicit source categories win over inferred naming or distance rules.
    if (
      rawCategory === 'UTE' ||
      rawCategory === 'UT' ||
      rawCategory === 'TL' ||
      rawCategory === 'TC' ||
      rawCategory === 'MINI'
    ) {
      return rawCategory;
    }

    // Ultra Trail Endurance is reserved for distances beyond 100 km.
    if (distance.distanceKm > 100) {
      return 'UTE';
    }

    const normalizedName = distance.name.trim().toUpperCase();

    if (normalizedName.includes('ULTRA')) {
      return 'UT';
    }

    if (normalizedName.includes('LONGO') || normalizedName.includes('XL')) {
      return 'TL';
    }

    if (normalizedName.includes('CURTO')) {
      return 'TC';
    }

    if (normalizedName.includes('MINI')) {
      return 'MINI';
    }

    return 'OTHER';
  }
}
