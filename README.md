# berlin_re_sim
A game to simulate berlin real estate situation

This repo starts as a minimal Mesa-style agent-based prototype. The first
playable scope is Mitte, with data structures that can later expand to all of
Berlin and support a richer UI.

## Core Idea

The game models one shared physical housing stock with two connected markets:

- rental contracts for households
- purchase offers for apartments, buildings, and land parcels

That split matters because hidden dynamics often appear between the markets:
investor demand can change owner behavior, owner behavior changes rental supply,
rental scarcity changes household displacement pressure, and policy changes can
shift all of those incentives.

## Suggested First Run

Start with synthetic Mitte data in `data/scenarios/mitte_seed.json`, then replace
pieces with real data later.

```bash
python3 -m berlin_re_sim
```

For the first browser prototype, open `web/index.html`, or serve it on your
local network for phone testing:

```bash
cd web
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `http://YOUR_COMPUTER_IP:8000` from a phone on the same Wi-Fi.

## Project Map

- `docs/model_design.md` explains the data structure and simulation loop.
- `docs/visualization_values.md` lists the signals worth showing in the game.
- `data/scenarios/mitte_seed.json` is the first small scenario.
- `src/berlin_re_sim/schemas.py` defines the durable domain objects.
- `src/berlin_re_sim/model.py` contains the Mesa-compatible model skeleton.
- `web/index.html` is a dependency-free visualization/game prototype.
