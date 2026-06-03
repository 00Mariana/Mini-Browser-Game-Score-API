# Session Memory — FNAF Arcade Game

## Project
`Mini-Browser-Game-Score-API` — FNAF Whack-a-Mole arcade game with score API.

## Setup
- **Package manager:** pnpm only (no npm)
- **Run:** `pnpm start`
- **Open:** `http://localhost:3000`

## What's Built (complete)

### Server (`server/index.js`)
- Express 5 + better-sqlite3 (SQLite)
- DB table: `scores` (id, player_name, score, created_at)
- `POST /api/scores` — submit score
- `GET /api/scores/leaderboard?limit=10` — top scores
- `GET /api/scores/:playerName` — player history
- Serves static `client/` folder

### Client (`client/`)
- **index.html** — login screen → game canvas → game-over screen
- **style.css** — dark FNAF theme with red accents
- **game.js** — API functions, game loop, HUD, click handler, all UI wired up
- Player name input, history display, play again / menu buttons

## Background — Complete ✅
`drawBackground()` has all 5 layers working:
1. **Checkered wall** — red/white tiles, y=0 to y=380
2. **Red curtains** — left and right sides with fold lines
3. **Yellow star lights** — across the top (fixed missing `#`)
4. **Wooden stage floor** — brown fill, edge strip, horizontal + vertical plank lines (fixed empty loop body)
5. **Cage-door openings** — dark holes with metallic rims and cross bars

### Bugs fixed this session
- `'ffdd44'` → `'#ffdd44'` (missing `#`)
- `canvas.wdith` → `canvas.width` (typo)
- Floor plank `for` loop body was empty — added `moveTo`/`lineTo`/`stroke`
- `ctx.arch()` → `ctx.arc()` (wrong method name)
- Crossbar `lineTo(h.x, + h.radius, h.y)` → `lineTo(h.x + h.radius, h.y)` (extra comma)

## Completed This Session ✅

### Spawning logic (`update()`)
- Added `spawnTimer: 0` to state
- Spawn timer counts down by `dt` each frame
- When it hits 0: picks random hole, creates animatronic `{ holeIndex, popUpTime, duration, hit }`, resets timer to 1–3s
- Despawn: `filter()` removes expired animatronics (`popUpTime - timeLeft > duration`), costs 1 life

### Drawing animatronics (`render()`)
- Brown circle body with white eyes + red pupils at hole position
- Offset `y-10` so it looks like it's peeking out of the hole

### Click detection (canvas click handler)
- Loops animatronics backwards, checks distance from click to hole center
- If within 30px: marks `hit = true`, adds 10 score, breaks (one hit per click)

### Bugs fixed this session
- Typo `duariton` → `duration` (filter was checking wrong property)
- Body `arc` x offset `hole.x - 10` → `hole.x` (was off-center)

## Where We Left Off

All core game mechanics work:
- ✅ Spawn animatronics at random holes
- ✅ Draw them as FNAF-style heads with eyes
- ✅ Click to hit (score +10, they disappear)
- ✅ Miss = expired animatronic costs a life
- ✅ Game ends at 0 lives or 30s

## Character Rendering — In Progress 🔧

### Done
- `CHARACTERS` array defined (lines 74-111) with 4 animatronics:
  - Freddy Fazbear: brown, round ears, hat, normal eyes, stitched mouth
  - Bonnie: purple, tall ears, angry eyes, straight mouth
  - Chica: yellow, tuft ears, big eyes, beak mouth
  - Foxy: red, pointed ears, eyepatch, zigzag mouth
- `characterIndex` added to spawn object in `update()` (line 259)
- `render()` updated to pass `char` to `drawAnimatronic()` (line 280)
- `drawAnimatronic(x, y, char)` function created (line 218)
- Step 1 complete: head circle using `char.bodyColor` + white eyes + red pupils

### Bugs fixed this session
- `Math.Pi` → `Math.PI` (wrong capitalization)
- Left eye x position `x + 10` → `x - 10` (both eyes were on right side)
- Added missing right pupil

### Still pending for `drawAnimatronic`
- Snout (oval using `char.snoutColor`)
- Ears (if/else on `char.earType`: round, tall, tuft, pointed)
- Mouth (if/else on `char.mouthStyle`: stitched, straight, beak, zigzag)
- Hat (if `char.hasHat` — only Freddy)

### Other pending items
- No sound effects or visual feedback on hit
- Leaderboard display in UI (API exists but only history is shown)
