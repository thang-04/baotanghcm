import { describe, expect, it } from 'vitest';
import { AVATAR_OUTFITS, getAvatarOutfit } from './avatarCatalog';

describe('avatar identity', () => {
  it('uses school uniform for new visitors, missing and invalid network identities', () => {
    for (const id of [undefined, null, '', 'football', {}, '__proto__']) {
      expect(getAvatarOutfit(id).id).toBe('student');
    }
  });
  it('preserves each supported outfit when resolving stored or remote identities', () => {
    for (const outfit of AVATAR_OUTFITS) expect(getAvatarOutfit(outfit.id)).toEqual(outfit);
    expect(new Set(AVATAR_OUTFITS.map(outfit => outfit.id)).size).toBe(4);
  });
});
