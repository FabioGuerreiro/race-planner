import { TestBed } from '@angular/core/testing';

import { MyCalendarService } from './my-calendar.service';

describe('MyCalendarService', () => {
  let service: MyCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyCalendarService);
  });

  it('adds calendar items to shared in-memory state', () => {
    service.addItem({
      raceId: 'race-1',
      distanceId: 'distance-1',
      priority: 'A',
      intention: 'maybe',
      notes: 'Key race',
    });

    expect(service.items()).toEqual([
      {
        id: 'race-1-distance-1',
        raceId: 'race-1',
        distanceId: 'distance-1',
        priority: 'A',
        intention: 'maybe',
        notes: 'Key race',
      },
    ]);
  });

  it('replaces existing entries for the same race distance', () => {
    service.addItem({
      raceId: 'race-1',
      distanceId: 'distance-1',
      priority: 'A',
      intention: 'maybe',
    });
    service.addItem({
      raceId: 'race-1',
      distanceId: 'distance-1',
      priority: 'B',
      intention: 'maybe',
      notes: 'Updated',
    });

    expect(service.items()).toEqual([
      {
        id: 'race-1-distance-1',
        raceId: 'race-1',
        distanceId: 'distance-1',
        priority: 'B',
        intention: 'maybe',
        notes: 'Updated',
      },
    ]);
  });

  it('removes calendar items', () => {
    service.addItem({
      raceId: 'race-1',
      distanceId: 'distance-1',
      priority: 'C',
      intention: 'maybe',
    });

    service.removeItem('race-1-distance-1');

    expect(service.items()).toEqual([]);
  });
});
