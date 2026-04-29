import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RacePriority } from '../../core/models/my-calendar-item.model';
import { RaceDistanceCategory } from '../../core/models/race-distance.model';
import { MyCalendarService } from '../../core/services/my-calendar.service';
import { RaceService } from '../../core/services/race.service';

@Component({
  selector: 'app-race-list',
  imports: [DatePipe],
  templateUrl: './race-list.component.html',
  styleUrl: './race-list.component.scss',
})
export class RaceListComponent {
  private readonly raceService = inject(RaceService);
  private readonly myCalendarService = inject(MyCalendarService);

  protected readonly races = toSignal(this.raceService.getRaces(), { initialValue: [] });
  protected readonly selectedDate = signal('');
  protected readonly selectedCircuit = signal('');
  protected readonly selectedLocation = signal('');
  protected readonly selectedCategory = signal<RaceDistanceCategory | ''>('');
  protected readonly selectedDistanceIds = signal<Record<string, string>>({});
  protected readonly selectedPriorities = signal<Record<string, RacePriority>>({});
  protected readonly notesByRaceId = signal<Record<string, string>>({});
  protected readonly calendarDialogRaceId = signal('');

  /**
   * Unique month options derived from race dates, formatted for select controls.
   * */
  protected readonly dateOptions = computed(() =>
    [...new Set(this.races().map((race) => this.toMonthValue(race.date)))].map((value) => ({
      value,
      label: this.toMonthLabel(value),
    })),
  );

  /**
   * Unique circuit options across all loaded races, preserving circuit ids for filtering.
   * */
  protected readonly circuitOptions = computed(() =>
    [
      ...new Map(
        this.races()
          .flatMap((race) => race.circuits)
          .map((circuit) => [circuit.id, circuit]),
      ).values(),
    ].sort((first, second) => first.name.localeCompare(second.name)),
  );

  protected readonly locationOptions = computed(() =>
    [...new Set(this.races().map((race) => race.district))].sort((first, second) => first.localeCompare(second)),
  );

  /**
   * Unique category options derived from all race distances, sorted alphabetically. This allows users to filter races by distance category (e.g., UTE, UT, TL, etc.).
   */
  protected readonly categoryOptions = computed(() =>
    [...new Set(this.races().flatMap((race) => race.distances.map((distance) => distance.category)))].sort(),
  );

  /** Filtered race list; each active filter narrows the visible calendar. */
  protected readonly filteredRaces = computed(() =>
    this.races().filter(
      (race) =>
        (!this.selectedDate() || this.toMonthValue(race.date) === this.selectedDate()) &&
        (!this.selectedCircuit() || race.circuits.some((circuit) => circuit.id === this.selectedCircuit())) &&
        (!this.selectedLocation() || race.district === this.selectedLocation()) &&
        (!this.selectedCategory() || race.distances.some((distance) => distance.category === this.selectedCategory())),
    ),
  );

  protected readonly calendarDialogRace = computed(() =>
    this.races().find((race) => race.id === this.calendarDialogRaceId()),
  );

  /**
   * Race count of race list component
   */
  protected readonly raceCount = computed(() => this.filteredRaces().length);

  /**
   * Determines whether any filters are currently active
   */
  protected readonly hasActiveFilters = computed(
    () =>
      Boolean(this.selectedDate()) ||
      Boolean(this.selectedCircuit()) ||
      Boolean(this.selectedLocation()) ||
      Boolean(this.selectedCategory()),
  );

  /**
   * Clears all active filters
   */
  protected clearFilters(): void {
    this.selectedDate.set('');
    this.selectedCircuit.set('');
    this.selectedLocation.set('');
    this.selectedCategory.set('');
  }

  protected distanceSelectionFor(raceId: string): string {
    return this.selectedDistanceIds()[raceId] || '';
  }

  protected prioritySelectionFor(raceId: string): RacePriority {
    return this.selectedPriorities()[raceId] ?? 'C';
  }

  protected notesFor(raceId: string): string {
    return this.notesByRaceId()[raceId] || '';
  }

  protected selectDistance(raceId: string, distanceId: string): void {
    this.selectedDistanceIds.update((values) => ({ ...values, [raceId]: distanceId }));
  }

  protected selectPriority(raceId: string, priority: RacePriority): void {
    this.selectedPriorities.update((values) => ({ ...values, [raceId]: priority }));
  }

  protected setCalendarNotes(raceId: string, notes: string): void {
    this.notesByRaceId.update((values) => ({ ...values, [raceId]: notes }));
  }

  protected openCalendarDialog(raceId: string): void {
    this.calendarDialogRaceId.set(raceId);
  }

  protected closeCalendarDialog(): void {
    this.calendarDialogRaceId.set('');
  }

  protected addDialogSelectionToCalendar(): void {
    const raceId = this.calendarDialogRaceId();

    if (!raceId) {
      return;
    }

    this.addToCalendar(raceId);
    this.closeCalendarDialog();
  }

  /** Adds the selected race distance to the shared in-memory calendar store. */
  protected addToCalendar(raceId: string): void {
    const distanceId = this.selectedDistanceIds()[raceId];

    if (!distanceId) {
      return;
    }

    this.myCalendarService.addItem({
      raceId,
      distanceId,
      priority: this.selectedPriorities()[raceId] ?? 'C',
      intention: 'maybe',
      notes: this.notesByRaceId()[raceId]?.trim() || undefined,
    });
  }

  /**
   * Converts a Date object to a month value string in the format "YYYY-MM".
   * @param date The date to convert.
   * @returns The month value string.
   */
  private toMonthValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Converts a month value string in the format "YYYY-MM" to a human-readable label like "March 2024".
   * @param value The month value string to convert.
   * @returns The human-readable month label.
   */
  private toMonthLabel(value: string): string {
    const [year, month] = value.split('-').map(Number);

    return new Date(year, month - 1).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
  }
}
