# Room 4 — Phase 9 implementation

## Outcome

Station 8 is now the conclusion of the established Moscow → Guangzhou journey, not a separate map experience. It waits for the completion of all eight stations, then gathers the five core imprints — **Lý luận, Tổ chức, Báo chí, Cán bộ, Mạng lưới** — at the Return Map and hands the visitor toward Room 5.

The entrance card and the two-part spatial sequence remain unchanged:

```text
Room 3 → Journey Card → Soviet stations 1–3 → transition corridor
       → Guangzhou stations 4–8 → Room 5 exit
```

## Implemented behavior

- `journeyFinaleReady` is derived only when the eight station-completion tokens (`s1`–`s8`) exist. Station 8 remains gated by the existing linear journey, so it cannot be used to bypass an earlier station.
- Completing the fourth Station 8 route launches a 1.65-second convergence. Five lightweight HTML seals reuse the Journey Card labels and move into the `ReturnMap` hub.
- When the convergence finishes, the persisted `room4:v2:finale:return-map` token locks the completed Return Map, changes Station 8’s guide ring to the shared green completion state, and reveals five permanent labels on the map.
- The exit message is now only shown after the persisted finale completes: **“Hành trang đã sẵn sàng — Con đường về Tổ quốc.”**
- On a later visit, the completed map is static and does not replay the flight. Visitors can explicitly choose **“Xem lại hội tụ”** to replay it.
- At low/ultra-low settings or with animations off, the same completion token and static map state are applied without the flight animation.

## Files changed for Phase 9

- `src/lib/roomFourJourney.ts` — finale seal set, persisted finale token, and the eight-station guard.
- `src/components/3d/rooms/RoomFour.tsx` — Station 8 finale orchestration, five-seal flight, persistent Return Map state, and green final guide.
- `src/components/3d/rooms/room-four/RoomFourJourneyOverlay.tsx` — finale/exit messaging and the voluntary replay control.

## Demo checklist

1. Complete the Journey Card and stations 1 through 7 in order.
2. At Station 8, activate all four routes. The dialog closes and the five imprints converge on the Return Map; after the convergence, the Station 8 guide becomes green and the Room 5 exit message is visible.
3. Reset or use a new visitor profile; stop before any required station, then try the map. The existing journey gate names the next required station and the finale does not start.
4. After completing the finale, leave Room 4 and enter again. The map remains a complete network with all five labels, without replaying the flight. Use **“Xem lại hội tụ”** to replay it intentionally.
5. Switch to `low` or `ultra-low` and repeat the final Station 8 action. The map reaches the same persistent completed state without the animated flight.

## Verification

- `npx tsc --noEmit --pretty false` ✓
- Focused ESLint on the three Phase 9 files ✓
- `npm run build` ✓
