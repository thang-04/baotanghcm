export const AVATAR_OUTFITS = [
  { id: 'student', name: 'Đồng phục học sinh', shirt: '#fffaf0', trousers: '#223957', accent: '#ac3933' },
  { id: 'baba', name: 'Áo bà ba', shirt: '#865d42', trousers: '#302a29', accent: '#d8b889' },
  { id: 'aodai', name: 'Áo dài cách điệu', shirt: '#417e7d', trousers: '#fff3dc', accent: '#eed18a' },
  { id: 'casual', name: 'Trang phục thường ngày', shirt: '#da965d', trousers: '#4b6573', accent: '#fff3dc' },
] as const;

export type OutfitId = typeof AVATAR_OUTFITS[number]['id'];
export const DEFAULT_OUTFIT_ID: OutfitId = 'student';
export function getAvatarOutfit(id: unknown) {
  return AVATAR_OUTFITS.find(outfit => outfit.id === id) ?? AVATAR_OUTFITS[0];
}
