import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RaceService } from './race.service';

describe('RaceService', () => {
  let service: RaceService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RaceService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads races from the public dummy data and sorts them by date', () => {
    service.getRaces().subscribe((races) => {
      expect(races.map((race) => race.id)).toEqual(['early-race', 'later-race']);
      expect(races[0].date).toBeInstanceOf(Date);
      expect(races[0].distances.map((distance) => distance.name)).toEqual(['Short', 'Long']);
      expect(races[0].distances.map((distance) => distance.category)).toEqual(['TC', 'TL']);
      expect(races[0].circuits.map((circuit) => circuit.name)).toEqual(['Regional Cup']);
    });

    const racesRequest = httpTesting.expectOne('/races-dummy.json');
    expect(racesRequest.request.method).toBe('GET');
    racesRequest.flush([
      {
        id: 'later-race',
        name: 'Later Race',
        date: '2026-05-02T07:00:00',
        location: 'Fundao',
        district: 'Castelo Branco',
        municipality: 'Fundao',
        organizer: 'UTG Organization',
        status: 'announced',
      },
      {
        id: 'early-race',
        name: 'Early Race',
        date: '2026-01-25T07:00:00',
        location: 'Querenca',
        district: 'Faro',
        municipality: 'Loule',
        organizer: 'AA Algarve',
        status: 'confirmed',
      },
    ]);

    const distancesRequest = httpTesting.expectOne('/races-distances-dummy.json');
    expect(distancesRequest.request.method).toBe('GET');
    distancesRequest.flush([
      {
        id: 'early-long',
        raceId: 'early-race',
        name: 'Long',
        distanceKm: 30,
        elevationGainM: 1000,
        atrpCategory: 'TL',
      },
      {
        id: 'early-short',
        raceId: 'early-race',
        name: 'Short',
        distanceKm: 15,
        elevationGainM: 500,
        atrpCategory: 'TC',
      },
      {
        id: 'later-long',
        raceId: 'later-race',
        name: 'Long',
        distanceKm: 25,
        elevationGainM: 800,
        atrpCategory: 'TL',
      },
    ]);

    const circuitsRequest = httpTesting.expectOne('/circuits-dummy.json');
    expect(circuitsRequest.request.method).toBe('GET');
    circuitsRequest.flush([
      {
        id: 'regional-cup',
        name: 'Regional Cup',
        type: 'regional',
        season: '2026',
      },
    ]);

    const raceCircuitsRequest = httpTesting.expectOne('/race-circuits-dummy.json');
    expect(raceCircuitsRequest.request.method).toBe('GET');
    raceCircuitsRequest.flush([
      {
        raceId: 'early-race',
        circuitId: 'regional-cup',
        season: '2026',
      },
    ]);
  });

  it('normalizes distance names and marks distances longer than 100 km as UTE', () => {
    service.getRaces().subscribe((races) => {
      expect(races[0].distances.map((distance) => distance.category)).toEqual(['TL', 'UT', 'OTHER', 'UTE']);
    });

    httpTesting.expectOne('/races-dummy.json').flush([
      {
        id: 'mixed-race',
        name: 'Mixed Race',
        date: '2026-01-25T07:00:00',
        location: 'Querenca',
        district: 'Faro',
        municipality: 'Loule',
        organizer: 'AA Algarve',
        status: 'confirmed',
      },
    ]);

    httpTesting.expectOne('/races-distances-dummy.json').flush([
      {
        id: 'trail-xl',
        raceId: 'mixed-race',
        name: 'Trail XL',
        distanceKm: 25,
        elevationGainM: 1000,
      },
      {
        id: 'ultra',
        raceId: 'mixed-race',
        name: 'Ultra Trail',
        distanceKm: 45,
        elevationGainM: 1500,
      },
      {
        id: 'unknown-80',
        raceId: 'mixed-race',
        name: 'Endurance',
        distanceKm: 80,
        elevationGainM: 3500,
      },
      {
        id: 'endurance-101',
        raceId: 'mixed-race',
        name: 'Endurance',
        distanceKm: 101,
        elevationGainM: 4500,
      },
    ]);
    httpTesting.expectOne('/circuits-dummy.json').flush([]);
    httpTesting.expectOne('/race-circuits-dummy.json').flush([]);
  });
});
