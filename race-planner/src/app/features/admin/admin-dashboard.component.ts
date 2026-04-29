import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Circuit, CircuitType } from '../../core/models/circuit.model';
import { RaceCircuit } from '../../core/models/race-circuit.model';
import { Race, RaceStatus } from '../../core/models/race.model';
import { RaceService } from '../../core/services/race.service';

/** Admin-only workspace for managing mock race and circuit data before backend persistence exists. */
@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly raceService = inject(RaceService);

  private readonly loadedRaces = toSignal(this.raceService.getRaces(), { initialValue: [] });
  private readonly loadedCircuits = toSignal(this.raceService.getCircuits(), { initialValue: [] });
  private readonly loadedRaceCircuits = toSignal(this.raceService.getRaceCircuits(), { initialValue: [] });
  private readonly seeded = signal(false);

  /** Local editable copy of races; changes are intentionally in-memory for the frontend MVP. */
  protected readonly races = signal<Race[]>([]);
  /** Local editable copy of circuits used by the association form. */
  protected readonly circuits = signal<Circuit[]>([]);
  /** In-memory join records preserving the many-to-many race/circuit relationship. */
  protected readonly raceCircuits = signal<RaceCircuit[]>([]);
  protected readonly selectedRaceId = signal('');

  protected readonly raceForm = new FormGroup({
    id: new FormControl('', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    district: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    municipality: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    organizer: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl<RaceStatus>('announced', { nonNullable: true }),
    officialUrl: new FormControl('', { nonNullable: true }),
    registrationUrl: new FormControl('', { nonNullable: true }),
  });

  protected readonly circuitForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<CircuitType>('regional', { nonNullable: true }),
    season: new FormControl('2026', { nonNullable: true, validators: [Validators.required] }),
    website: new FormControl('', { nonNullable: true }),
  });

  protected readonly associationForm = new FormGroup({
    raceId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    circuitId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    season: new FormControl('2026', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl('', { nonNullable: true }),
  });

  protected readonly raceCount = computed(() => this.races().length);
  protected readonly circuitCount = computed(() => this.circuits().length);

  constructor() {
    // Seed editable admin state once from mock data; later form edits should not be overwritten.
    effect(() => {
      if (this.seeded() || !this.loadedRaces().length) {
        return;
      }

      this.races.set(this.loadedRaces().map(({ distances, circuits, ...race }) => race));
      this.circuits.set(this.loadedCircuits());
      this.raceCircuits.set(this.loadedRaceCircuits());
      this.seeded.set(true);
    });
  }

  /** Creates a new race or updates the selected race from the form values. */
  protected saveRace(): void {
    if (this.raceForm.invalid) {
      this.raceForm.markAllAsTouched();
      return;
    }

    const formValue = this.raceForm.getRawValue();
    const race: Race = {
      id: this.selectedRaceId() || formValue.id || this.toSlug(`${formValue.name}-${formValue.date}`),
      name: formValue.name,
      date: new Date(`${formValue.date}T07:00:00`),
      location: formValue.location,
      district: formValue.district,
      municipality: formValue.municipality,
      organizer: formValue.organizer,
      status: formValue.status,
      ...(formValue.officialUrl ? { officialUrl: formValue.officialUrl } : {}),
      ...(formValue.registrationUrl ? { registrationUrl: formValue.registrationUrl } : {}),
    };

    this.races.update((races) =>
      races.some((currentRace) => currentRace.id === race.id)
        ? races.map((currentRace) => (currentRace.id === race.id ? race : currentRace))
        : [...races, race],
    );
    this.resetRaceForm();
  }

  /** Loads a race into the form for editing without changing existing associations. */
  protected editRace(race: Race): void {
    this.selectedRaceId.set(race.id);
    this.raceForm.setValue({
      id: race.id,
      name: race.name,
      date: this.toDateInputValue(race.date),
      location: race.location,
      district: race.district,
      municipality: race.municipality,
      organizer: race.organizer,
      status: race.status,
      officialUrl: race.officialUrl ?? '',
      registrationUrl: race.registrationUrl ?? '',
    });
  }

  /** Removes a race and any circuit associations that point to it. */
  protected deleteRace(raceId: string): void {
    this.races.update((races) => races.filter((race) => race.id !== raceId));
    this.raceCircuits.update((raceCircuits) => raceCircuits.filter((raceCircuit) => raceCircuit.raceId !== raceId));

    if (this.selectedRaceId() === raceId) {
      this.resetRaceForm();
    }
  }

  /** Returns the race form to create mode. */
  protected resetRaceForm(): void {
    this.selectedRaceId.set('');
    this.raceForm.reset({
      id: '',
      name: '',
      date: '',
      location: '',
      district: '',
      municipality: '',
      organizer: '',
      status: 'announced',
      officialUrl: '',
      registrationUrl: '',
    });
  }

  /** Creates a circuit in local admin state for later race association. */
  protected saveCircuit(): void {
    if (this.circuitForm.invalid) {
      this.circuitForm.markAllAsTouched();
      return;
    }

    const formValue = this.circuitForm.getRawValue();
    const circuit: Circuit = {
      id: this.toSlug(`${formValue.name}-${formValue.season}`),
      name: formValue.name,
      type: formValue.type,
      season: formValue.season,
      ...(formValue.website ? { website: formValue.website } : {}),
    };

    this.circuits.update((circuits) =>
      circuits.some((currentCircuit) => currentCircuit.id === circuit.id)
        ? circuits.map((currentCircuit) => (currentCircuit.id === circuit.id ? circuit : currentCircuit))
        : [...circuits, circuit],
    );
    this.circuitForm.reset({
      name: '',
      type: 'regional',
      season: '2026',
      website: '',
    });
  }

  /** Adds a race-circuit join record unless that association already exists. */
  protected associateRaceToCircuit(): void {
    if (this.associationForm.invalid) {
      this.associationForm.markAllAsTouched();
      return;
    }

    const formValue = this.associationForm.getRawValue();
    const association: RaceCircuit = {
      raceId: formValue.raceId,
      circuitId: formValue.circuitId,
      season: formValue.season,
      ...(formValue.category ? { category: formValue.category } : {}),
    };

    this.raceCircuits.update((raceCircuits) => {
      const alreadyAssociated = raceCircuits.some(
        (raceCircuit) =>
          raceCircuit.raceId === association.raceId &&
          raceCircuit.circuitId === association.circuitId &&
          raceCircuit.season === association.season,
      );

      return alreadyAssociated ? raceCircuits : [...raceCircuits, association];
    });
  }

  protected raceName(raceId: string): string {
    return this.races().find((race) => race.id === raceId)?.name ?? raceId;
  }

  protected circuitName(circuitId: string): string {
    return this.circuits().find((circuit) => circuit.id === circuitId)?.name ?? circuitId;
  }

  /** Builds stable ids for newly created mock records from human-readable names. */
  private toSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
