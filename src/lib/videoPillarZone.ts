export type VideoPillarTransition = 'enter' | 'leave' | 'none';

export function isInsideVideoPillarZone(
  playerX: number,
  playerZ: number,
  centerX: number,
  centerZ: number,
  radius: number,
): boolean {
  const dx = playerX - centerX;
  const dz = playerZ - centerZ;
  return dx * dx + dz * dz < radius * radius;
}

export function getVideoPillarTransition(
  wasInside: boolean,
  isInside: boolean,
): VideoPillarTransition {
  if (!wasInside && isInside) return 'enter';
  if (wasInside && !isInside) return 'leave';
  return 'none';
}
