const stations = {
  'journey-v1-1': { roomId: 'gallery-subsidy', x: -8, z: 18 },
  'journey-v1-2': { roomId: 'gallery-subsidy', x: 8, z: 42 },
  'journey-v1-3': { roomId: 'gallery-three', x: -6, z: 65 },
  'journey-v1-4': { roomId: 'gallery-three', x: 6, z: 90 },
  'journey-v1-5': { roomId: 'gallery-ceramics', x: -8, z: 159 },
  'journey-v1-6': { roomId: 'gallery-ceramics', x: 8, z: 172 },
  'journey-v1-7': { roomId: 'gallery-market-economy', x: -4, z: 189 },
  'journey-v1-8': { roomId: 'gallery-market-economy', x: 4, z: 246 },
  'journey-v1-9': { roomId: 'gallery-paintings', x: -8, z: 114 },
  'journey-v1-10': { roomId: 'gallery-paintings', x: 8, z: 141 },
};

const INTERACTION_RADIUS = 3.2;

function isAtStation(questionId, position) {
  const station = stations[questionId];
  if (!station || !position) return false;
  return Math.hypot(position.x - station.x, position.z - station.z) <= INTERACTION_RADIUS;
}

module.exports = { stations, INTERACTION_RADIUS, isAtStation };
