import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { MyCalendarItem } from '../../core/models/my-calendar-item.model';
import { RaceDistance } from '../../core/models/race-distance.model';
import { MyCalendarService } from '../../core/services/my-calendar.service';
import { RaceService, RaceWithDistances } from '../../core/services/race.service';

type CalendarViewMode = 'list' | 'monthly';

interface PlannedCalendarEntry {
  item: MyCalendarItem;
  race: RaceWithDistances;
  distance: RaceDistance;
}

interface MonthlyCalendarGroup {
  label: string;
  entries: PlannedCalendarEntry[];
}

@Component({
  selector: 'app-my-calendar',
  imports: [DatePipe],
  templateUrl: './my-calendar.component.html',
  styleUrl: './my-calendar.component.scss',
})
export class MyCalendarComponent {
  private readonly raceService = inject(RaceService);
  private readonly myCalendarService = inject(MyCalendarService);

  protected readonly races = toSignal(this.raceService.getRaces(), { initialValue: [] });
  protected readonly items = this.myCalendarService.items;
  protected readonly viewMode = signal<CalendarViewMode>('list');

  /** Joins saved calendar items back to race and distance details for display. */
  protected readonly plannedItems = computed(() =>
    this.items()
      .map((item) => {
        const race = this.races().find((candidate) => candidate.id === item.raceId);
        const distance = race?.distances.find((candidate) => candidate.id === item.distanceId);

        return race && distance ? { item, race, distance } : undefined;
      })
      .filter((entry): entry is PlannedCalendarEntry => Boolean(entry))
      .sort((first, second) => first.race.date.getTime() - second.race.date.getTime()),
  );

  /** Groups planned races by month for the monthly calendar view. */
  protected readonly monthlyGroups = computed(() => {
    const groups = this.plannedItems().reduce<Record<string, PlannedCalendarEntry[]>>((months, entry) => {
      const label = this.toMonthLabel(entry.race.date);
      months[label] = [...(months[label] ?? []), entry];
      return months;
    }, {});

    return Object.entries(groups).map(([label, entries]): MonthlyCalendarGroup => ({ label, entries }));
  });

  protected removeItem(itemId: string): void {
    this.myCalendarService.removeItem(itemId);
  }

  private toMonthLabel(date: Date): string {
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
}
