// The event date/time helpers must agree on how to read a naive wall clock,
// because the column behind them carries no zone. Writes used to parse as local
// time while reads formatted as UTC, so an event came back shifted by the
// server's offset — invisible in UTC containers, wrong on any other machine.
// These tests run the round trip under several zones so the asymmetry cannot
// return unnoticed.

import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { fromEventDateTime, toEventDateTime } from '@repo/schemas/events';

const ORIGINAL_TZ = process.env.TZ;

// A positive offset, a negative one, a half-hour one, and the zone containers run.
const ZONES = ['UTC', 'Europe/Amsterdam', 'America/New_York', 'Asia/Kolkata'];

describe('event date and time encoding', () => {
  beforeEach(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  describe.each(ZONES)('in %s', (zone) => {
    beforeEach(() => {
      process.env.TZ = zone;
    });

    it('returns the wall clock the organiser entered', () => {
      const stored = toEventDateTime('2026-09-06', '18:00');

      expect(fromEventDateTime(stored)).toEqual({ date: '2026-09-06', time: '18:00' });
    });

    it('keeps midnight on its own day', () => {
      const stored = toEventDateTime('2026-09-06', '00:00');

      expect(fromEventDateTime(stored)).toEqual({ date: '2026-09-06', time: '00:00' });
    });

    it('keeps the last minute of the day on that day', () => {
      const stored = toEventDateTime('2026-09-06', '23:59');

      expect(fromEventDateTime(stored)).toEqual({ date: '2026-09-06', time: '23:59' });
    });

    it('pads single-digit months, days and hours', () => {
      const stored = toEventDateTime('2026-01-02', '03:04');

      expect(fromEventDateTime(stored)).toEqual({ date: '2026-01-02', time: '03:04' });
    });
  });

  it('orders two events by their wall clock, whatever the zone', () => {
    process.env.TZ = 'Asia/Kolkata';

    const earlier = toEventDateTime('2026-09-06', '09:00');
    const later = toEventDateTime('2026-09-06', '17:30');

    // The listings queries sort on this column, so the instants must keep the
    // same order as the strings they came from.
    expect(earlier.getTime()).toBeLessThan(later.getTime());
  });
});
