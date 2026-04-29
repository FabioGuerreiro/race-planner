import { Injectable, signal } from '@angular/core';

import { MyCalendarItem } from '../models/my-calendar-item.model';

/** Shared in-memory planning store for the current app session. */
@Injectable({ providedIn: 'root' })
export class MyCalendarService {
  private readonly calendarItems = signal<MyCalendarItem[]>([]);

  /** Calendar entries remain available while navigating between routes until full reload. */
  readonly items = this.calendarItems.asReadonly();

  /** Adds or replaces a planned race distance for the same race and distance. */
  addItem(item: Omit<MyCalendarItem, 'id'>): void {
    const id = `${item.raceId}-${item.distanceId}`;
    const nextItem: MyCalendarItem = { ...item, id };

    this.calendarItems.update((items) =>
      items.some((current) => current.id === id)
        ? items.map((current) => (current.id === id ? nextItem : current))
        : [...items, nextItem],
    );
  }

  /** Removes one planned race distance from My Calendar. */
  removeItem(itemId: string): void {
    this.calendarItems.update((items) => items.filter((item) => item.id !== itemId));
  }
}
