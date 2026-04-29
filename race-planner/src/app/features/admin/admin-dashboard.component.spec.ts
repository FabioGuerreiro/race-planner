import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RaceService } from '../../core/services/race.service';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        {
          provide: RaceService,
          useValue: {
            getRaces: () =>
              of([
                {
                  id: 'existing-race',
                  name: 'Existing Race',
                  date: new Date('2026-01-25T07:00:00'),
                  location: 'Querenca',
                  district: 'Faro',
                  municipality: 'Loule',
                  organizer: 'AA Algarve',
                  status: 'confirmed',
                  distances: [],
                  circuits: [],
                },
              ]),
            getCircuits: () =>
              of([
                {
                  id: 'existing-circuit',
                  name: 'Existing Circuit',
                  type: 'regional',
                  season: '2026',
                },
              ]),
            getRaceCircuits: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
  });

  it('renders race and circuit management areas', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Race Management');
    expect(compiled.textContent).toContain('Circuit Management');
    expect(compiled.textContent).toContain('Existing Race');
    expect(compiled.textContent).toContain('Existing Circuit');
  });

  it('creates a race', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const newRaceButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent === 'New race',
    );
    newRaceButton?.click();
    fixture.detectChanges();

    const form = compiled.querySelector('[role="dialog"] form') as HTMLFormElement;
    const inputs = form.querySelectorAll('input');
    const status = form.querySelector('select') as HTMLSelectElement;

    inputs[0].value = 'New Race';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = '2026-04-12';
    inputs[1].dispatchEvent(new Event('input'));
    inputs[2].value = 'Sintra';
    inputs[2].dispatchEvent(new Event('input'));
    inputs[3].value = 'Sintra';
    inputs[3].dispatchEvent(new Event('input'));
    inputs[4].value = 'Lisboa';
    inputs[4].dispatchEvent(new Event('input'));
    inputs[5].value = 'Local Org';
    inputs[5].dispatchEvent(new Event('input'));
    status.value = 'announced';
    status.dispatchEvent(new Event('change'));

    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('New Race');
    expect(compiled.textContent).toContain('2 races');
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
  });

  it('edits and deletes a race', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const editButton = Array.from(compiled.querySelectorAll('button')).find((button) => button.textContent === 'Edit');

    editButton?.click();
    fixture.detectChanges();

    const form = compiled.querySelector('[role="dialog"] form') as HTMLFormElement;
    const nameInput = form.querySelector('input') as HTMLInputElement;
    nameInput.value = 'Updated Race';
    nameInput.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Updated Race');

    const deleteButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent === 'Delete',
    );
    deleteButton?.click();
    fixture.detectChanges();

    expect(compiled.textContent).not.toContain('Updated Race');
    expect(compiled.textContent).toContain('0 races');
  });

  it('creates a circuit and associates a race to a circuit', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const createCircuitButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent === 'Create circuit',
    );
    createCircuitButton?.click();
    fixture.detectChanges();

    const circuitForm = compiled.querySelector('[role="dialog"] form') as HTMLFormElement;
    const circuitInputs = circuitForm.querySelectorAll('input');
    const circuitType = circuitForm.querySelector('select') as HTMLSelectElement;

    circuitInputs[0].value = 'National Cup';
    circuitInputs[0].dispatchEvent(new Event('input'));
    circuitType.value = 'national';
    circuitType.dispatchEvent(new Event('change'));
    circuitInputs[1].value = '2026';
    circuitInputs[1].dispatchEvent(new Event('input'));
    circuitForm.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('2 circuits');

    const associateRaceButton = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent === 'Associate race',
    );
    associateRaceButton?.click();
    fixture.detectChanges();

    const associationForm = compiled.querySelector('[role="dialog"] form') as HTMLFormElement;
    const associationSelects = associationForm.querySelectorAll('select');
    const associationInputs = associationForm.querySelectorAll('input');
    associationSelects[0].value = 'existing-race';
    associationSelects[0].dispatchEvent(new Event('change'));
    associationSelects[1].value = 'national-cup-2026';
    associationSelects[1].dispatchEvent(new Event('change'));
    associationInputs[0].value = '2026';
    associationInputs[0].dispatchEvent(new Event('input'));
    associationForm.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Existing Race');
    expect(compiled.textContent).toContain('National Cup · 2026');
  });
});
