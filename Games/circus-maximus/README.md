# Circus Maximus - Tabletop Simulation

A web-based tabletop simulation of the Circus Maximus board game, featuring AI opponents and automated playtesting capabilities for game balance analysis.

## Game Overview

Circus Maximus is a worker placement board game for 2-4 players with multiple phases and varied win conditions. This digital implementation allows for:
- Playtesting with AI opponents
- Automated balance analysis
- Easy rule adjustments through configuration files

## Project Status

Currently in development - MVP phase.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required

### Running the Game

1. Open `index.html` in your web browser
2. Follow the on-screen instructions to start a game
3. Play against AI opponents or other human players

### Project Structure

```
circus-maximus/
├── README.md           - This file
├── .gitignore          - Git ignore rules
├── .cursorrules        - Cursor AI rules for this project
├── rulebook/           - Game rulebook (editable)
├── index.html          - Main game page
├── css/                - Stylesheets
├── js/                 - JavaScript game code
│   ├── game/          - Core game logic
│   ├── ai/            - AI player implementation
│   ├── ui/            - User interface
│   └── utils/         - Utilities and configuration
└── assets/            - Game assets (future)
```

## Configuration

All game numbers and balance values are in `js/utils/config.js`. Edit this file to adjust game mechanics after playtesting.

## Development

This is a vanilla JavaScript project with no build step. Simply edit the files and refresh your browser.

## License

Personal project - all rights reserved.
