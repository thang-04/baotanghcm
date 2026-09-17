import { describe, expect, it } from 'vitest';
import { createTeleportMovePayload } from './teleportSync';

describe('createTeleportMovePayload', () => {
  it('builds the movement update required after an admin teleport', () => {
    expect(createTeleportMovePayload({ x: 1, y: 3, z: 102 }, 0.5)).toEqual({
      x: 1,
      y: 3,
      z: 102,
      yaw: 0.5,
      isSitting: false,
      headYaw: 0,
    });
  });
});
