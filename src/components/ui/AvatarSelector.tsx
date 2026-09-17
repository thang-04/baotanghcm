'use client';

import { AVATAR_OUTFITS, getAvatarOutfit } from '@/lib/avatarCatalog';

export function AvatarPreview({ outfitId }: { outfitId: string }) {
  const outfit = getAvatarOutfit(outfitId);
  return <svg viewBox="0 0 80 104" className="mx-auto h-24 w-20" aria-hidden="true">
    <ellipse cx="40" cy="98" rx="24" ry="4" fill="#ded5c4" />
    <path d="M28 65h10v28H27zm14 0h10l1 28H42z" fill={outfit.trousers} />
    <path d="M25 37 15 60l8 4 8-16h18l8 16 8-4-10-23Z" fill={outfit.shirt} stroke="#403b3220" />
    <path d={outfit.id === 'aodai' ? 'M28 37h24l5 43-17-6-17 6Z' : 'M28 37h24l2 33H26Z'} fill={outfit.shirt} stroke="#403b3220" />
    <path d="m33 38 7 9 7-9" fill="none" stroke={outfit.accent} strokeWidth="3" />
    {outfit.id === 'baba' && <path d="M40 46v21M29 56h6v6h-6m16-6h6v6h-6" fill="none" stroke={outfit.accent} />}
    <circle cx="40" cy="23" r="15" fill="#e8c9a8" />
    <path d="M25 23C21 2 58 0 55 23l-6-10-20 5Z" fill="#302f2e" />
    <circle cx="35" cy="24" r="1.4" fill="#302f2e" /><circle cx="45" cy="24" r="1.4" fill="#302f2e" />
    <path d="M26 93h12v5H24zm16 0h12l2 5H42z" fill="#343839" />
  </svg>;
}

export function AvatarSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return <fieldset className="w-full text-left">
    <legend className="mb-2 text-xs font-semibold text-stone-600">Chọn trang phục</legend>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {AVATAR_OUTFITS.map(outfit => <label key={outfit.id} className={`cursor-pointer rounded-xl border p-2 text-center transition-colors ${getAvatarOutfit(value).id === outfit.id ? 'border-teal-700 bg-teal-50 text-teal-950' : 'border-stone-200 bg-white text-stone-700'}`}>
        <input type="radio" name="avatar-outfit" value={outfit.id} checked={getAvatarOutfit(value).id === outfit.id} onChange={() => onChange(outfit.id)} className="accent-teal-700" />
        <AvatarPreview outfitId={outfit.id} />
        <span className="block text-xs font-semibold leading-4">{outfit.name}</span>
      </label>)}
    </div>
  </fieldset>;
}

export default AvatarSelector;
