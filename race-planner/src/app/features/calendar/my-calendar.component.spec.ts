import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MyCalendarService } from '../../core/services/my-calendar.service';
import { RaceService } from '../../core/services/race.service';
import { MyCalendarComponent } from './my-calendar.component';

describe('MyCalendarComponent', () => {
  let fixture: ComponentFixture<MyCalendarComponent>;
  let myCalendarService: MyCalendarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCalendarComponent],
      providers: [
        MyCalendarService,
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
                  status: 'confirmed',
                  circuits: [],
                  distances: [
                    {
                      id: 'algarve-xtreme-curto-2026',
                      raceId: 'algarve-xtreme-trail-2026',
                      name: 'Trail Curto',
                      distanceKm: 18,
                      elevationGainM: 700,
                      category: 'TC',
                    },
                  ],
                },
              ]),
          },
        },
      ],
    }).compileComponents();

    myCalendarService = TestBed.inject(MyCalendarService);
    myCalendarService.addItem({
      raceId: 'algarve-xtreme-trail-2026',
      distanceId: 'algarve-xtreme-curto-2026',
      priority: 'A',
      intention: 'maybe',
      notes: 'Season goal',
    });

    fixture = TestBed.createComponent(MyCalendarComponent);
    fixture.detectChanges();
  });

  it('renders planned races from the shared calendar service', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('My Calendar');
    expect(compiled.textContent).toContain('Algarve Xtreme Trail');
    expect(compiled.textContent).toContain('Priority A');
    expect(compiled.textContent).toContain('Season goal');
  });

  it('switches to monthly view', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const monthlyButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent === 'Monthly',
    );

    monthlyButton?.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('January 2026');
    expect(compiled.textContent).toContain('18 km');
  });

  it('removes planned races', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const removeButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent === 'Remove',
    );

    removeButton?.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('No races in your calendar yet.');
  });
});
