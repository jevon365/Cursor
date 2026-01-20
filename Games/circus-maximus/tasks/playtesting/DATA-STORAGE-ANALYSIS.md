# Playtesting Data Storage & Analysis Recommendations

## Overview

**Primary Analysis Tools: R (R Markdown) + Tableau**

This guide is optimized for R/R Markdown and Tableau workflows. Data is stored as JSON in JavaScript, then exported to CSV for analysis in R and Tableau.

---

## Workflow Overview

1. **Collect** → Run playtests in JavaScript, save as JSON
2. **Export** → Convert JSON to CSV (or read JSON directly in R)
3. **Analyze** → Use R Markdown for statistical analysis and reporting
4. **Visualize** → Use Tableau for interactive dashboards
5. **Report** → Generate HTML/PDF reports from R Markdown

---

## Storage Strategy

### 1. Primary Format: JSON (In-Memory + Files)

**Why:** 
- Native to JavaScript - no conversion needed
- Structured - easy to query and filter
- Flexible - can add fields without breaking existing code
- Works with R, Python, SQL, Tableau

**Structure:**
```javascript
// Single game result
{
  metadata: {
    gameId: 1,
    timestamp: 1234567890,
    configVersion: "v1.0",
    playerCount: 2,
    difficulty: "medium",
    testRun: "baseline-2024-01-15"
  },
  summary: {
    winner: "AI Player 1",
    winTrack: "empire",
    rounds: 8,
    duration: 1234, // ms
    completed: true
  },
  players: [
    {
      name: "AI Player 1",
      finalScores: {
        empire: 15,
        population: 8,
        church: 5,
        total: 28
      },
      resources: { coins: 12, mummers: 3, animals: 2, slaves: 1, prisoners: 0 },
      // ... more stats
    }
  ],
  detailed: {
    locationUsage: { port: 3, war: 2, forest: 1, ... },
    actParticipation: { gladiator_combat: true, choral_performance: false, ... },
    workerDeaths: { port: 1, war: 0, forest: 1 },
    coinFlipResults: { port: { wins: 2, losses: 1 }, war: { wins: 2, losses: 0 }, ... },
    marketPurchases: { mummers: [1,2,1], animals: [3,4], slaves: [5] },
    // ... more detailed metrics
  }
}
```

### 2. File Organization

```
playtesting/
├── data/
│   ├── raw/
│   │   ├── baseline/
│   │   │   ├── run-2024-01-15-100-games.json
│   │   │   └── run-2024-01-15-2-players.json
│   │   ├── after-market-change/
│   │   │   └── run-2024-01-20-100-games.json
│   │   └── config-comparison/
│   │       ├── config-a-50-games.json
│   │       └── config-b-50-games.json
│   └── exports/
│       ├── baseline.csv          # For R/Tableau
│       ├── baseline-detailed.csv # Expanded metrics
│       └── comparison.csv
└── analysis/
    ├── r/
    │   ├── load-data.R           # Data loading functions
    │   ├── analyze-baseline.Rmd  # Baseline analysis report
    │   ├── compare-configs.Rmd   # Config comparison report
    │   └── utils/
    │       ├── balance-metrics.R # Balance calculation functions
    │       └── visualizations.R  # Reusable viz functions
    ├── tableau/
    │   ├── playtest-dashboard.twbx
    │   └── config-comparison.twbx
    └── reports/
        ├── baseline-analysis.html
        └── balance-report.html
```

**File Naming Convention:**
`{test-name}-{date}-{game-count}games-{player-count}players.json`

Examples:
- `baseline-2024-01-15-100games-2players.json`
- `market-change-v2-2024-01-20-50games-4players.json`

### 3. Storage Implementation

**Option A: Local File System (Recommended for now)**
- Save to `playtesting/data/raw/` folder
- Use browser download API or Node.js file system
- Easy version control with git

**Option B: IndexedDB (For browser-only)**
- Store in browser database
- Can query/analyze without file downloads
- Limited by browser storage (~5-10MB)

**Option C: SQLite (For Node.js/advanced)**
- Convert JSON to SQLite for querying
- Use SQL for analysis (fits your SQL background)
- Can export to CSV for R/Tableau

---

## Analysis Tools & Methods

### 1. Built-in JavaScript Analysis (Quick Insights)

**Enhance PlaytestEngine with statistical functions:**

```javascript
// Add to PlaytestEngine.js

getAdvancedStatistics() {
  if (this.results.length === 0) return null;
  
  const rounds = this.results.map(r => r.rounds);
  const durations = this.results.map(r => r.duration);
  
  return {
    // Basic stats
    totalGames: this.results.length,
    completedGames: this.results.filter(r => r.completed).length,
    
    // Game length stats
    rounds: {
      mean: this.mean(rounds),
      median: this.median(rounds),
      stdDev: this.stdDev(rounds),
      min: Math.min(...rounds),
      max: Math.max(...rounds),
      q1: this.percentile(rounds, 25),
      q3: this.percentile(rounds, 75)
    },
    
    // Duration stats
    duration: {
      mean: this.mean(durations),
      median: this.median(durations),
      stdDev: this.stdDev(durations)
    },
    
    // Win distribution
    winDistribution: this.calculateWinDistribution(),
    trackWins: this.calculateTrackWins(),
    
    // Outliers
    outliers: this.findOutliers(rounds),
    
    // Confidence intervals (95%)
    confidenceInterval: {
      rounds: this.confidenceInterval(rounds, 0.95),
      duration: this.confidenceInterval(durations, 0.95)
    }
  };
}

// Statistical helper functions
mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

stdDev(arr) {
  const avg = this.mean(arr);
  const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(this.mean(squareDiffs));
}

percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  return sorted[Math.floor(index)];
}

confidenceInterval(arr, confidence = 0.95) {
  const mean = this.mean(arr);
  const stdDev = this.stdDev(arr);
  const z = 1.96; // For 95% confidence
  const margin = z * (stdDev / Math.sqrt(arr.length));
  return {
    lower: mean - margin,
    upper: mean + margin
  };
}

findOutliers(arr) {
  const mean = this.mean(arr);
  const stdDev = this.stdDev(arr);
  const threshold = 2 * stdDev;
  return arr.filter(val => Math.abs(val - mean) > threshold);
}
```

### 2. CSV Export (For External Analysis)

**Perfect for R, Excel, Tableau:**

```javascript
// Add to PlaytestEngine.js

exportToCSV() {
  const headers = [
    'gameId', 'timestamp', 'playerCount', 'difficulty', 'winner', 
    'winTrack', 'rounds', 'duration', 'completed',
    'player1_empire', 'player1_population', 'player1_church',
    'player2_empire', 'player2_population', 'player2_church',
    // ... more columns
  ];
  
  const rows = this.results.map(result => [
    result.gameId,
    result.timestamp || Date.now(),
    result.playerCount,
    result.difficulty,
    result.winner || '',
    result.winTrack || '',
    result.rounds,
    result.duration,
    result.completed ? 1 : 0,
    // ... player scores
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csv;
}

downloadCSV(filename = 'playtest-results.csv') {
  const csv = this.exportToCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 3. R Analysis Workflow (Primary Method)

**Preferred Approach: R Markdown for analysis + Tableau for visualization**

See the R Markdown templates in `analysis/r/` folder for complete examples.

### 4. SQL Analysis (If Using SQLite)

If you convert to SQLite:

```sql
-- Create tables
CREATE TABLE playtest_games (
  game_id INTEGER PRIMARY KEY,
  timestamp INTEGER,
  player_count INTEGER,
  difficulty TEXT,
  winner TEXT,
  win_track TEXT,
  rounds INTEGER,
  duration INTEGER,
  completed BOOLEAN
);

CREATE TABLE playtest_players (
  game_id INTEGER,
  player_name TEXT,
  empire INTEGER,
  population INTEGER,
  church INTEGER,
  coins INTEGER,
  FOREIGN KEY (game_id) REFERENCES playtest_games(game_id)
);

-- Analysis queries
SELECT 
  AVG(rounds) as avg_rounds,
  STDDEV(rounds) as stddev_rounds,
  MIN(rounds) as min_rounds,
  MAX(rounds) as max_rounds
FROM playtest_games;

SELECT win_track, COUNT(*) as wins
FROM playtest_games
WHERE completed = 1
GROUP BY win_track;

-- Compare configs
SELECT 
  config,
  AVG(rounds) as avg_rounds,
  COUNT(*) as game_count
FROM playtest_games
GROUP BY config;
```

### 5. Tableau Prep (For Visualization)

**Steps:**
1. Export to CSV
2. Load into Tableau
3. Create dashboards for:
   - Win distribution charts
   - Game length distribution
   - Track win rates
   - Location usage heatmaps
   - Act participation rates

**Recommended Visualizations:**
- **Win Distribution:** Bar chart (by track, by player)
- **Game Length:** Histogram + box plot
- **Track Progression:** Line chart showing track values over rounds
- **Resource Usage:** Stacked bar chart
- **Location Usage:** Heatmap or treemap

---

## Enhanced Data Collection

### Recommended Metrics Per Game

Expand the result object to collect:

```javascript
const result = {
  // Existing
  gameId, playerCount, difficulty, winner, rounds, duration,
  
  // NEW: Detailed metrics
  detailed: {
    // Location usage
    locationUsage: {
      port: { attempts: 5, successes: 3, deaths: 2 },
      war: { attempts: 3, successes: 2, deaths: 1 },
      forest: { attempts: 4, successes: 2, deaths: 2 },
      prison: { totalWorkers: 12, prisonersGained: 12 },
      townSquare: { visits: 2 },
      palace: { visits: 3 },
      pantheon: { visits: 1 },
      guildhall: { purchases: 1 },
      // ... all locations
    },
    
    // Act participation
    actParticipation: {
      gladiator_combat: { bids: 8, participants: 6, winners: 3 },
      choral_performance: { bids: 2, participants: 2, winners: 0 },
      // ... all acts
    },
    
    // Market activity
    marketActivity: {
      mummers: { 
        purchases: 15, 
        totalSpent: 25,
        priceTiersUsed: [1,1,2,2,3,3,4,4,5],
        depleted: false
      },
      // ... other markets
    },
    
    // Event impact
    events: [
      { round: 1, event: "plague_strikes", impact: "blocked_population" },
      { round: 3, event: "victory_celebration", impact: "all_gained_coins" },
      // ...
    ],
    
    // Track progression (per round, per player)
    trackProgression: [
      {
        round: 1,
        players: [
          { empire: 3, population: 3, church: 3 },
          { empire: 3, population: 3, church: 3 }
        ]
      },
      // ...
    ],
    
    // Resource flow
    resourceFlow: {
      starting: { player1: { coins: 15, workers: 5 }, ... },
      ending: { player1: { coins: 12, workers: 4 }, ... },
      totalGained: { player1: { mummers: 8, animals: 3, slaves: 5 }, ... },
      totalSpent: { player1: { coins: 45, workers: 1 }, ... }
    }
  }
};
```

---

## Recommended Workflow

### 1. **Data Collection**
```javascript
// Run playtests
const engine = new PlaytestEngine();
await engine.runBatch(100, 2, 'medium');

// Save with metadata
const data = {
  metadata: {
    testName: 'baseline',
    date: new Date().toISOString().split('T')[0],
    configVersion: 'v1.0',
    description: 'Initial balance test'
  },
  results: engine.results,
  statistics: engine.getAdvancedStatistics()
};

// Save to file
engine.saveToFile('baseline-2024-01-15-100games.json', data);
```

### 2. **Quick Analysis (In Browser)**
```javascript
// Get stats
const stats = engine.getAdvancedStatistics();
console.table(stats);

// Check for issues
if (stats.trackWins.empire > 0.5) {
  console.warn('Empire track wins too often!');
}
```

### 3. **Deep Analysis (R/Tableau)**
```javascript
// Export to CSV
engine.downloadCSV('baseline-analysis.csv');

// Then analyze in R or Tableau
```

### 4. **Comparison**
```javascript
// Load previous results
const baseline = engine.loadFromFile('baseline-2024-01-15-100games.json');
const afterChange = engine.loadFromFile('market-change-2024-01-20-100games.json');

// Compare
const comparison = engine.compareResults(baseline, afterChange);
console.table(comparison);
```

---

## Implementation Priority

1. **High Priority:**
   - ✅ Enhanced statistics functions (mean, median, std dev)
   - ✅ CSV export
   - ✅ File saving with metadata
   - ✅ Win distribution tracking

2. **Medium Priority:**
   - Detailed metrics collection (location usage, act participation)
   - Confidence interval calculations
   - Comparison utilities
   - Outlier detection

3. **Low Priority:**
   - SQLite conversion
   - Tableau dashboard templates
   - R script templates
   - Advanced visualizations

---

## Quick Start Recommendation

**Start with:**
1. Enhance `getStatistics()` with std dev, median, min/max
2. Add CSV export method
3. Add file save/load methods
4. Create a simple comparison function

**Then expand:**
- Collect more detailed metrics
- Add visualization in browser
- Create R/Python analysis scripts
- Build Tableau dashboards

This gives you immediate value while keeping the door open for advanced analysis.
