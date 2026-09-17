import { describe, expect, it } from 'vitest';
import {
  getVideoPillarTransition,
  isInsideVideoPillarZone,
} from './videoPillarZone';

describe('video pillar activation zone', () => {
  it('treats a player inside the 3-meter radius as active', () => {
    expect(isInsideVideoPillarZone(2.9, 0, 0, 0, 3)).toBe(true);
  });

  it('treats a player on or outside the radius boundary as inactive', () => {
    expect(isInsideVideoPillarZone(3, 0, 0, 0, 3)).toBe(false);
    expect(isInsideVideoPillarZone(4, 0, 0, 0, 3)).toBe(false);
  });

  it('reports only an outside-to-inside transition as enter', () => {
    expect(getVideoPillarTransition(false, true)).toBe('enter');
    expect(getVideoPillarTransition(true, true)).toBe('none');
  });

  it('reports only an inside-to-outside transition as leave', () => {
    expect(getVideoPillarTransition(true, false)).toBe('leave');
    expect(getVideoPillarTransition(false, false)).toBe('none');
  });
});
