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

Choose a simulation method:

```bash
python3 -m berlin_re_sim --method agent_based
python3 -m berlin_re_sim --method markov_chain
python3 -m berlin_re_sim --method mcmc_state
```

For the first browser prototype, open `web/index.html`, or serve it on your
local network for phone testing:

```bash
cd web
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `http://YOUR_COMPUTER_IP:8000` from a phone on the same Wi-Fi.

If the phone cannot connect:

- confirm the phone is not on mobile data or a guest Wi-Fi network
- check that the phone IP and computer IP start with the same first three parts,
  for example `192.168.139.x`
- try `http://192.168.139.227:8000` if this machine is still on the same network
- allow incoming connections for Python or port `8000` in the computer firewall
- if this project is running inside WSL, Docker, a VM, or a remote IDE, start the
  server from the host machine instead of the isolated environment

## Project Map

- `docs/model_design.md` explains the data structure and simulation loop.
- `docs/visualization_values.md` lists the signals worth showing in the game.
- `data/scenarios/mitte_seed.json` is the first small scenario.
- `src/berlin_re_sim/schemas.py` defines the durable domain objects.
- `src/berlin_re_sim/model.py` contains the Mesa-compatible model skeleton.
- `src/berlin_re_sim/methods/` contains selectable simulation methods.
- `web/index.html` is a dependency-free visualization/game prototype.
