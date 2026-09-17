import { describe, expect, it } from 'vitest';
import { formatRaceTime, csvCell, competitionRooms } from './competitionPresentation';

describe('competition presentation', () => {
  it('formats server elapsed milliseconds without inventing a completion time', () => {
    expect(formatRaceTime(null)).toBe('—');
    expect(formatRaceTime(61342)).toBe('01:01.342');
  });
  it('prevents spreadsheet formula execution and escapes player names', () => {
    expect(csvCell('=1+1')).toBe('"\'=1+1"');
    expect(csvCell('An "B"')).toBe('"An ""B"""');
  });
  it('maps the five actual room ids in display order', () => {
    expect(competitionRooms.map(r => r.id)).toEqual(['gallery-subsidy', 'gallery-three', 'gallery-ceramics', 'gallery-market-economy', 'gallery-paintings']);
  });
});
