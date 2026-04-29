import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RaceService } from '../../core/services/race.service';
import { RaceListComponent } from './race-list.component';

describe('RaceListComponent', () => {
  let fixture: ComponentFixture<RaceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaceListComponent],
      providers: [
        {
          provide: RaceService,
          useValue: {
            getRaces: () =>
              of([
                {
                  id: 'algarve-xtreme-trail-2026',
                  name: 'Algarve Xtreme Trail',
                  date: new Date('2026-01-25T07:00:00'),
                  location: 'Querenca',
                  district: 'Faro',
                  municipality: 'Loule',
                  organizer: 'AA Algarve',
                  officialUrl: 'https://example.com',
                  status: 'confirmed',
                  circuits: [
                    {
                      id: 'algarve-trail-series-2026',
                      name: 'Algarve Trail Series',
                      type: 'regional',
                      season: '2026',
                    },
                  ],
                  distances: [
                    {
                      id: 'algarve-xtreme-curto-2026',
                      raceId: 'algarve-xtreme-trail-2026',
                      name: 'Trail Curto',
                      distanceKm: 18,
                      elevationGainM: 700,
                      category: 'TC',
                      atrpCategory: 'TC',
                    },
                  ],
                },
                {
                  id: 'serra-trail-2026',
                  name: 'Serra Trail',
                  date: new Date('2026-03-15T09:00:00'),
                  location: 'Sintra',
                  district: 'Lisboa',
                  municipality: 'Sintra',
                  organizer: 'Local Organization',
                  status: 'announced',
                  circuits: [
                    {
                      id: 'national-trail-cup-2026',
                      name: 'National Trail Cup',
                      type: 'national',
                      season: '2026',
                    },
                  ],
                  distances: [
                    {
                      id: 'serra-ultra-2026',
                      raceId: 'serra-trail-2026',
                      name: 'Ultra Trail',
                      distanceKm: 45,
                      elevationGainM: 1800,
                      category: 'UT',
                    },
                  ],
                },
              ]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RaceListComponent);
    fixture.detectChanges();
  });

  it('renders races from the race service', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Races');
    expect(compiled.textContent).toContain('Algarve Xtreme Trail');
    expect(compiled.textContent).toContain('18 km');
    expect(compiled.textContent).toContain('Trail Curto');
    expect(compiled.textContent).toContain('2 races');
  });

  it('filters races by date, circuit, location, and category', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const selects = compiled.querySelectorAll('select');

    selects[0].value = '2026-03';
    selects[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Serra Trail');
    expect(compiled.textContent).not.toContain('Algarve Xtreme Trail');

    selects[1].value = 'national-trail-cup-2026';
    selects[1].dispatchEvent(new Event('change'));
    selects[2].value = 'Lisboa';
    selects[2].dispatchEvent(new Event('change'));
    selects[3].value = 'UT';
    selects[3].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Serra Trail');
    expect(compiled.textContent).not.toContain('Algarve Xtreme Trail');
    expect(compiled.textContent).toContain('1 races');
  });
});
