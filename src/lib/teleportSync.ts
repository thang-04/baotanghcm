export interface TeleportTarget {
  x: number;
  y: number;
  z: number;
}

export function createTeleportMovePayload(target: TeleportTarget, yaw: number) {
  return {
    x: target.x,
    y: target.y,
    z: target.z,
    yaw,
    isSitting: false,
    headYaw: 0,
  };
}
