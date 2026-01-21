# 🎪 Circus Maximus - Tabletop Game Simulation

A fully-featured web-based simulation of the **Circus Maximus** board game, built with vanilla JavaScript. Play against AI opponents in this strategic worker-placement game set in ancient Rome, where you compete for favor across three victory tracks: Empire, Population, and Church.

![Status](https://img.shields.io/badge/status-MVP-green)
![Tech](https://img.shields.io/badge/tech-Vanilla%20JS-blue)

## 🎮 Live Demo

*[Add your GitHub Pages link here once deployed]*

## ✨ Features

- **Complete Game Implementation**: Full 5-phase gameplay with all mechanics from the original board game
- **AI Opponents**: Play against intelligent AI players with configurable difficulty levels
- **Beautiful UI**: Modern, responsive interface with visual feedback and intuitive controls
- **Save/Load System**: Save your game progress and resume anytime
- **Automated Playtesting**: Built-in playtesting engine for game balance analysis
- **No Dependencies**: Pure vanilla JavaScript - no frameworks or build tools required

## 🎯 Project Overview

This project is a complete implementation of a complex board game simulation, built from the ground up with vanilla JavaScript. The architecture emphasizes clean separation of concerns, with modular game logic, AI decision-making, and UI components. All game mechanics are configuration-driven, making it easy to adjust balance and test different game variants.

**Key Technical Achievements:**
- **Phase-based game engine** with serializable state management
- **AI opponent system** with configurable difficulty levels and strategic decision-making
- **Automated playtesting framework** for game balance analysis
- **Zero-dependency architecture** - pure ES6 modules, no build tools required

## 🛠️ Technologies

- **Vanilla JavaScript** (ES6+ modules)
- **HTML5 & CSS3**
- **No build tools or dependencies** - runs directly in the browser
- **GitHub Pages ready** - deploy with zero configuration

## 🚀 Getting Started

### Quick Start (Play Locally)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/circus-maximus.git
   cd circus-maximus
   ```

2. **Start a local server** (required for ES6 modules)

   **Option A: VS Code Live Server** (Recommended)
   - Install the "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

   **Option B: Python**
   ```bash
   python server.py
   ```
   Then open: `http://localhost:8000/index.html`

   **Option C: Node.js**
   ```bash
   node server.js
   ```
   Then open: `http://localhost:8000/index.html`

   **Option D: Windows Batch File**
   - Double-click `start-server.bat`

### Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select your branch (usually `main` or `master`)
4. Your game will be live at `https://yourusername.github.io/circus-maximus/`

## 📁 Project Structure

```
circus-maximus/
├── index.html              # Main game page
├── css/                    # Stylesheets
├── js/
│   ├── game/              # Core game logic (GameEngine, GameState, etc.)
│   ├── ai/                # AI opponent implementation
│   ├── ui/                # User interface components
│   └── utils/             # Configuration and utilities
├── playtesting/           # Automated playtesting tools
└── rulebook/              # Game rulebook reference
```

## 🎨 Architecture & Design

- **Modular Game Engine**: Core game logic (`GameEngine`, `GameState`) completely decoupled from UI, enabling headless playtesting
- **Immutable State Pattern**: Game state is serializable JSON, enabling save/load and state snapshots for debugging
- **Configuration-Driven Design**: All game mechanics, values, and rules centralized in `config.js` for easy iteration
- **Phase-Based System**: Turn order and available actions managed per-phase with automatic transitions
- **Strategy Pattern for AI**: Pluggable strategy system allows for multiple AI implementations and difficulty levels

## 🤖 AI Implementation

The AI system uses a **strategy-based architecture** with heuristic evaluation and difficulty scaling:

- **BasicStrategy Class**: Makes decisions using scoring heuristics that evaluate game state, resource availability, and victory conditions
- **Difficulty Levels**: Three difficulty levels (easy, medium, hard) that adjust decision quality through a randomness parameter
- **Phase-Aware Decision Making**: AI evaluates different strategies for each game phase (bidding, worker placement, resource purchasing)
- **Heuristic Scoring**: Acts, locations, and market purchases are scored based on:
  - Victory track progression (weighted higher when close to winning)
  - Resource efficiency and availability
  - Coin management and bidding strategy
  - Risk assessment for worker placement actions

**Status**: ⏳ *Work in Progress* - Core framework implemented with basic strategy. Advanced tactics and look-ahead planning are planned for future iterations.

## 🧪 Testing & Playtesting

The project includes an **automated playtesting engine** designed for game balance analysis:

- **PlaytestEngine**: Runs AI vs AI games automatically to collect gameplay data
- **Data Collection**: Tracks game outcomes, resource usage, victory track progression, and win conditions
- **Statistical Analysis**: Collects metrics on game length, player performance, and balance indicators
- **Configurable Testing**: Can run multiple games with different player counts and difficulty levels
- **Export Capabilities**: Data can be exported for analysis in external tools (R, Tableau, etc.)

**Status**: ⏳ *Work in Progress* - Infrastructure complete, data analysis tools and reporting features are being developed.

## 📊 Development Status

This project is in **MVP status** with all core gameplay mechanics implemented:

✅ Complete 5-phase game loop  
✅ All 11 locations with full effects  
✅ Victory track system  
✅ Supply/demand market mechanics  
✅ AI opponent framework  
✅ Save/load functionality  
✅ Automated playtesting infrastructure  

## 🤝 Contributing

This is a personal portfolio project. If you'd like to contribute or have suggestions, feel free to open an issue!

## 📝 License

Personal project - all rights reserved.

---

**For developers working on this project**, see [`DEVELOPMENT.md`](DEVELOPMENT.md) for detailed technical documentation, architecture decisions, and development guidelines.
