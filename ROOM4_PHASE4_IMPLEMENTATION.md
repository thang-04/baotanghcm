# Room 4 — Phase 4 Implementation Handoff

## Outcome

Phase 4 turns the Phase 3 spatial masterplan into a playable, bilingual visitor journey while keeping the authoritative sequence from `ROOM4_TRAM_HANH_TRINH_LIEN_XO_QUANG_CHAU.md`:

`Room 3 → Journey Card → S1 → S2 → S3 → Moscow–Guangzhou transition → S4 → S5 → S6 → S7 → S8 → Room 5`

Room boundaries, the 18 m × 80 m shell, station coordinates, circulation spine, transition position, entrance, and exit remain unchanged. Phase 4 changes how visitors discover and complete the content inside that framework.

## Implemented Experience

| Stage | Central action | Result recorded on the Journey Card |
| --- | --- | --- |
| Entrance Card | Collect the 1923–1927 Journey Card | Unlocks S1 and persistent progress HUD |
| S1 · Moscow study desk | Examine three source books in sequence | **Theory / Lý luận** seal |
| S2 · International forum | Activate three dated international rings | **Relations / Quan hệ** and **Method / Phương pháp** seals |
| S3 · Guangzhou ticket | Stamp the November 1924 ticket | Guangzhou ticket milestone |
| S4 · Lý Thụy, 11/11/1924 | Reveal three missions | Lý Thụy three-mission milestone |
| S5 · Organisation nucleus | Connect the organisation nodes | **Organisation / Tổ chức** seal |
| S6 · *Thanh Niên* press | Run the press and reveal the first issue dated 21/6/1925 | **Press / Báo chí** seal |
| S7 · Secret classroom | Reveal four lesson themes from the 1925–before April 1927 training period | **Cadres / Cán bộ** seal |
| S8 · Routes home | Activate four return routes | **Network / Mạng lưới** seal and final exit message |

The detailed content includes the authoritative dates and names from the journey file, including the Peasant International (17/10/1923), the Fifth Comintern Congress (23/6/1924), the Red International of Labour Unions (21/7/1924), Lý Thụy's arrival in Guangzhou (11/11/1924), the first issue of *Thanh Niên* (21/6/1925), and the later publication of *Đường Kách Mệnh* (1927).

## Interaction and Feedback

- Every stage has one focal object, one clear action, and one short conclusion.
- Historical detail is revealed through a dedicated VI/EN interaction panel instead of permanent wall text.
- Actions are sequential inside each station and cannot be skipped.
- A future station stays visually muted and cannot be completed before the current station.
- Completion changes the exhibit, station ring, route lighting, label state, and Journey Card.
- There are no quizzes, scores, penalties, or incorrect-answer states.
- The Journey Card persists per visitor nickname through the existing museum progress storage.
- Player movement and camera drag pause while the interaction panel is open.
- The Room 5 threshold remains inactive until S8. Completing S8 changes it to the final “ready to return” message.

## Acceptance Checklist

| Requirement | Phase 4 status |
| --- | --- |
| Preserve Room 4 boundaries and structural framework | Complete |
| Preserve Card → S1–S8 journey order | Complete |
| Keep Moscow → Guangzhou as a transition, not a new station | Complete |
| Prevent completion by skipping core stations | Complete |
| Provide light, motion, object, and card feedback | Complete |
| Preserve exact historical names and dates | Complete |
| Support Vietnamese and English | Complete |
| Use seven core seals only | Complete |
| Keep ticket and three missions as milestones, not extra seals | Complete |
| Activate final exit message only after S8 | Complete |
| Avoid quiz/score/punishment mechanics | Complete |

## Main Files

- `src/components/3d/rooms/RoomFour.tsx` — station artifacts, visual states, proximity interaction, ordered journey control, and final threshold state.
- `src/components/3d/rooms/room-four/RoomFourJourneyOverlay.tsx` — viewport-anchored Journey Card HUD and bilingual interaction panel.
- `src/lib/roomFourJourney.ts` — authoritative bilingual station content, seven-seal model, milestone tokens, and progression helpers.
- `src/context/MuseumContext.tsx` — shared interaction-open state and persistent progress integration.
- `src/components/3d/PlayerCharacter.tsx`, `src/components/3d/GalleryCanvas.tsx`, and `src/app/lobby/page.tsx` — pause movement/camera input while a Room 4 panel is open.

## Demo

1. Run `npm run dev`.
2. Open `http://localhost:3000/gallery/gallery-market-economy`.
3. Enter any nickname and use the room password `sjkc21jdx2k23`.
4. Select the Journey Card exhibit beside the entrance and perform **Nhận Thẻ / Collect Card**.
5. Follow the illuminated route. At each active station, approach the central exhibit, select it, and perform its steps from top to bottom.
6. Confirm that future stations remain locked, each completed station updates the card and exhibit, and the cold Moscow palette intentionally shifts to the warmer Guangzhou palette after S3.
7. At S8, activate all four routes and confirm that the final Room 5 threshold message appears.
8. Switch the museum language and reopen the Journey Card or a completed station to verify the English content.

Use a new nickname to start from an empty card. Reusing a nickname intentionally restores that visitor's Room 4 progress.

## Verification

- `npx tsc --noEmit`
- `npx eslint src/components/3d/rooms/RoomFour.tsx src/components/3d/rooms/room-four/RoomFourJourneyOverlay.tsx src/lib/roomFourJourney.ts`
- `npm run build`
- In-app browser verification at the Room 4 gallery route: entrance render, Journey Card selection, first milestone recording, next-station activation, HUD placement, modal placement, and runtime console errors.

