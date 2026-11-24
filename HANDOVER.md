# Zoomies! A Labrador Adventure: handover

Handover for the Midland Counties Labrador Retriever Club (MCLRC) website, mclrc.co.uk. Written by Claude for Matt and for ChatGPT, who will put the game on the website.

## Message to paste into ChatGPT

> I'm attaching the MCLRC game "Zoomies!" (zoomies-mclrc.zip) and this handover. Please read HANDOVER.md first. I'd like help to:
> 1. put `index.html` on GitHub Pages in a new public repository,
> 2. add it to the Games page on mclrc.co.uk (Wix), under Show Centre, so it opens full screen,
> 3. keep the club leaderboard updated when members post their times.
>
> Please don't change the game code unless I ask. The whole game is the one file `index.html`.

## What it is

- A fast side-scrolling platformer, in the style of the classic speed platformers. The player is a cartoon Labrador chasing a magpie that stole the club's gold rosettes.
- It's one self-contained web page (`index.html`, about 290 KB). There are no images, audio files, libraries or servers: all the art, music and sound are drawn or synthesised in code. The only outside request is the Google Fonts stylesheet for the Fredoka font, and the game still works if that fails to load.
- It runs on desktop (keyboard or gamepad), tablet and phone (touch buttons, landscape only).
- It's child-friendly by design: no ads, no purchases, no accounts and no personal data. Progress is saved only in the player's own browser.

### Content

| World | Act 1 | Act 2 | Boss |
|---|---|---|---|
| 1 Home & Garden | Back Garden (mower chase) | Village Green (bouncy castles) | Robo-Mower |
| 2 Canal Towpath | Towpath (tunnel boat ride) | Lock Flight | Magpie on the Narrowboat |
| 3 Lakeside & Newfoundland | Lakeside (the big swim) | St John's Harbour (fetch the net float) | Magpie in a Speedboat |
| 4 Shooting Field | The Stubble Field (whistle stops, retrieves) | Woodland Drive (blind retrieve) | Runaway Clay Trap |
| 5 Championship Show | Benching Tent (agility course) | The Big Ring (steady trot for the judge) | Marquee Rooftops (final) |
| Christmas special | Christmas Walk (12 presents, ice) | | |

### Other features

- 3 hidden gold rosettes per act unlock 31 Kennel Book breed-fact pages. **The club committee must check the facts before launch.**
- The Wardrobe has collars and hats, unlocked by finding pages and beating worlds.
- Time trials: a "ghost" of your best run, plus a club target time.
- The club leaderboard is typed into the file by Matt (see below).
- Easy mode: the dog runs by itself and the player only jumps (recommended for young children). Other assist options are Gentle bumps, Even slower and Reduced motion.

## Files in this package

```
index.html          the complete game: this is the only file the website needs
HANDOVER.md         this document
source/build.py     rebuilds index.html from the source files (Python 3, no extra packages)
source/src/         the source, split into readable files (see the code map)
```

`index.html` is generated from `source/src/` by `python3 source/build.py`. There are two ways to make changes:
- **Small edits** (leaderboard, target times): edit `index.html` directly.
- **Anything else:** edit the files in `source/src/`, then run the build script to make a new `index.html`.

If you edit `index.html` directly, copy the same change into `source/src/` too, or the next build will undo it.

## Putting it online (GitHub Pages)

1. Create a **public** repository on GitHub, for example `mclrc-zoomies`.
2. Upload `index.html` to the root of the repository. Optionally, upload `bark.mp3` too (see "Real bark").
3. In the repository, go to Settings, then Pages. Choose to deploy from the `main` branch, root folder, and save.
4. After a minute or two the game is live at an address like `https://<github-user>.github.io/mclrc-zoomies/`. Open it on a phone and a computer to check it.
5. Optional: give it a club address such as `games.mclrc.co.uk` using GitHub Pages' custom domain setting and a CNAME record at whoever manages the domain's DNS.

**Choose the final address before launch.** Players' progress is saved per website address, so changing the address later resets everyone's progress and Kennel Book.

## Adding it to mclrc.co.uk (Wix)

The Games page (last item under the Show Centre menu) already lists the club's other games: Best in Show, Retrieve!, Colour Genetics, Spot the Fault and Pocket Lab.

1. Add a card for Zoomies! in the same style as the others:
   - Title: "Zoomies! A Labrador Adventure"
   - Line: "Race your Lab through five worlds to win back the club's gold rosettes"
   - Button: "Play"
2. Set the button to open the GitHub Pages address **in a new tab or full page**. This works best on phones, because the game needs the whole screen in landscape.
3. Optionally, also embed it on desktop with Wix's embed element pointed at the game's address. Make it at least 960 × 540 at a 16:9 ratio. Keep the "Play" link as well, for phones.
4. Don't paste the game's code into a Wix HTML box. Host the file and link to it.

## Updating the club leaderboard

Players press **Share my time** after an act. It copies a message such as:

> I ran Back Garden (1-1) in 0:38 with 2,020 points on Zoomies! Code UIEMF

They post that on the club Facebook page. To add it to the board:

1. Open the game, then Leaderboard, then "Check a shared time". Paste the message and press "Check it". The game says whether it's genuine and gives the exact line to add. A changed time won't match its code.
2. Open `index.html` (and `source/src/board.js`) in a text editor and find the block headed `CLUB LEADERBOARD` near the top of the script.
3. Add the entry under the right stage, for example:
   ```js
   '1-1': [['Sam B', '0:31', 2450], ['Bramble', '0:38', 2020]],  // Back Garden
   ```
   The format is `['Name', 'minutes:seconds', score]`. Order doesn't matter, because the board sorts itself by fastest time.
4. Upload the new `index.html` to GitHub. Everyone sees the update within a few minutes; they may need to refresh.

Stage codes are 1-1, 1-2, 1-B, 2-1, 2-2, 2-B, 3-1, 3-2, 3-B, 4-1, 4-2, 4-B, 5-1, 5-2, 5-B and X-1 (Christmas).

**Safeguarding:** use a first name and initial, or the dog's name, never a child's full name. The check code stops casual tampering but isn't cheat-proof, so don't use it for valuable prizes.

### Club target times and "Beat the committee"

These live in `CLUB_TIMES` in `source/src/levels.js` (search for `CLUB_TIMES` in `index.html`). Each stage has a "Club target". Committee members' times can be added beside it, and the results screen will list them:

```js
'1-1': [['Club target', 34], ['Committee: Your name', 31]],
```

Times here are in **seconds**.

## Real bark

Record a short, clean bark from a club Lab, about half a second long. Save it as `bark.mp3` and upload it to the same folder as `index.html`. The game uses it automatically in place of the made-up bark. It only works when the game is hosted online, not when the file is opened from a computer.

## Code map (for developers)

Everything is plain JavaScript drawing to an HTML canvas. The build wraps all the files in one block, in this order:

| File | What it holds |
|---|---|
| `board.js` | The club leaderboard (`CLUB_BOARD`) and the share/check-code helpers (`Board`) |
| `core.js` | Helpers, saving (`Save`, using localStorage key `zoomies-mclrc-v1`), input (`Input`: keyboard, touch, gamepad) and `Sound` (synthesised effects, music tracks, the `bark.mp3` loader) |
| `world.js` | Terrain: `Piece`/`Terrain` (height-map ground), `Builder` (level-shaping helpers) and `Level` (placement helpers) |
| `player.js` | The Labrador's physics (`PH` constants for speed and jump, `Player`): slopes, loops, water, springs, getting hurt |
| `art.js` | Drawing the dog (`drawDog`), enemies, items, platforms, loops, decor, world styles (`WORLDS`) and backgrounds (`buildLayers`) |
| `art2.js` | Drawing for Worlds 3, 4 and Christmas, new characters, wardrobe items (`COLLARS`, `HATS`) and people |
| `entities.js` | Enemy behaviour (`updEnemies`), projectiles and bosses (`makeBoss`, `updBoss`, `drawBoss`) |
| `extras.js` | Set-piece mechanics: retrieve to hand, whistle stops, agility hurdles, mower chase, canal tunnel, ice, currents, presents |
| `game.js` | The main loop (`Game`): fixed 60 Hz updates, camera, rendering, HUD, ghost runs, results |
| `levels.js` | Every stage (`lvl11` … `lvlX1`), the stage list (`STAGES`), `CLUB_TIMES` and the Kennel Book (`FACTS`) |
| `ui.js` | Menus and screens (title, stage map, results, Kennel Book, Wardrobe, Leaderboard, Options), hints and the `boot()` start-up |
| `shell.html` | The page itself: HTML, CSS, touch buttons and menu markup. The build inserts the script at `/*__SCRIPTS__*/` |

### Useful facts

- **Speeds:** full-control top speed is `PH.TOP` (7.5) and Easy mode auto-run is 4.8. Both are set in `player.js`.
- **Building a level:** shape the ground with `Builder`, for example `b.flat(600)`, `b.hill(500, 60)`, `b.pool(900, 130)`, `b.cliff(-90)`, `b.ramp(300, 90)`. Then place things with the `Level` helpers: `L.row()`, `L.arc()`, `L.spring()`, `L.loop()`, `L.enemy()`, `L.rosette()`, `L.check()`, `L.sign()`, `L.fin()`. Copy an existing `lvl…` function as a template.
- **Adding a stage:** write a `lvl…` function, add it to `STAGES`, then add three facts with keys `'<id>-0'`, `'<id>-1'` and `'<id>-2'` to `FACTS`, plus a `CLUB_TIMES` entry.
- **Testing:** `window.__Z` exposes test helpers. For example, `__Z.start('3-2')` jumps to a stage. These are harmless to leave in.
- **Saves:** progress uses localStorage key `zoomies-mclrc-v1`, and best-run ghosts use `zoomies-ghost-<stage>`.

## Rules to keep

- No ads, purchases, gambling-style rewards or collection of personal data. If an online leaderboard is ever added, use preset names rather than typed ones, because children play.
- Keep the club's navy and gold, and the cartoon Lab.
- The Kennel Book facts should be checked by the club before going public.

## Checklist before launch

- [ ] Committee has checked the 31 Kennel Book pages (`FACTS` in `levels.js`).
- [ ] Played on an iPhone, an Android phone, an iPad or tablet, and a laptop (Chrome, Safari, Edge).
- [ ] Easy mode tried by a young child. Full control tried by an older player.
- [ ] Sound works after the first tap (phones only allow sound after a tap).
- [ ] The final web address is decided before announcing it (saves are tied to it).
- [ ] The Games page card opens the game full screen on a phone.
- [ ] Optional: `bark.mp3` uploaded, committee times added to `CLUB_TIMES`.

## Known limitations

- The leaderboard updates only when a new `index.html` is uploaded. A live, automatic board would need a small database server.
- Progress is saved per browser and per device; it doesn't move between a player's phone and computer.
- Playing in portrait shows a "turn your phone sideways" screen.
- All testing so far was automated in a desktop browser. A real-device playtest with club families is the most valuable next step.
