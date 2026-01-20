# Playtesting Documentation

## Overview

This directory contains all documentation, procedures, and tools for playtesting Circus Maximus and analyzing game balance.

---

## Directory Structure

```
playtesting/
├── README.md                    # This file - start here
├── PLAYTESTING-REFERENCE.md     # Main playtesting plan & tasks
├── PLAYTESTING-ANALYSIS.md      # Analysis of the plan (what's missing)
├── DATA-STORAGE-ANALYSIS.md     # Complete data storage guide
├── R-ANALYSIS-QUICKSTART.md     # Quick start for R analysis
├── TABLEAU-GUIDE.md             # Tableau visualization guide
│
├── data/                        # All playtesting data
│   ├── README.md                # Data storage rules & procedures
│   ├── raw/                     # Original JSON data files
│   │   ├── baseline/            # Baseline test runs
│   │   ├── config-comparison/   # A/B tests
│   │   └── after-market-change/ # Tests after changes
│   └── exports/                 # CSV files for analysis
│
└── analysis/                    # Analysis tools & scripts
    ├── r/                       # R analysis scripts
    │   ├── load-data.R          # Data loading functions
    │   ├── analyze-baseline.Rmd # Baseline analysis template
    │   ├── compare-configs.Rmd  # Config comparison template
    │   └── utils/               # Utility functions
    ├── tableau/                 # Tableau workbooks
    └── reports/                 # Generated reports (HTML/PDF)
```

---

## Quick Start

### 1. Read the Main Plan
Start with **`PLAYTESTING-REFERENCE.md`** - this has the full playtesting plan with tasks and priorities.

### 2. Understand Data Storage
Read **`data/README.md`** - this has all the rules for storing and organizing playtest data.

### 3. Run Playtests
Use `PlaytestEngine.js` to run automated tests, then export data to CSV.

### 4. Analyze Results
- **Quick analysis:** Use R Markdown templates in `analysis/r/`
- **Visualizations:** Use Tableau (see `TABLEAU-GUIDE.md`)
- **Deep dive:** See `R-ANALYSIS-QUICKSTART.md`

---

## Key Documents

### Getting Started
- **`PLAYTESTING-REFERENCE.md`** - Main playtesting plan with tasks
- **`PLAYTESTING-ANALYSIS.md`** - What's missing/what to add to the plan
- **`data/README.md`** - Data storage rules and procedures

### Analysis Tools
- **`R-ANALYSIS-QUICKSTART.md`** - Quick start guide for R analysis
- **`TABLEAU-GUIDE.md`** - Complete Tableau visualization guide
- **`DATA-STORAGE-ANALYSIS.md`** - Detailed data storage guide

### Analysis Scripts
- **`analysis/r/analyze-baseline.Rmd`** - Baseline analysis template
- **`analysis/r/compare-configs.Rmd`** - Config comparison template
- **`analysis/r/load-data.R`** - Data loading functions
- **`analysis/r/utils/balance-metrics.R`** - Balance calculation functions

---

## Workflow

### Standard Playtesting Workflow

```
1. Run Playtests
   ↓
   JavaScript: PlaytestEngine.js
   Export: CSV to data/exports/
   
2. Analyze in R
   ↓
   R Markdown: analyze-baseline.Rmd
   Generate: HTML report
   
3. Visualize in Tableau
   ↓
   Import: CSV from data/exports/
   Create: Dashboard
   Save: analysis/tableau/
   
4. Make Adjustments
   ↓
   Update: config.js
   Re-test: Compare with baseline
   
5. Document Changes
   ↓
   Update: rulebook/rulebook.md
   Record: What changed & why
```

### Data Storage Workflow

```
1. Collect Data
   → Save JSON to data/raw/{category}/
   → Follow naming convention
   → Include metadata
   
2. Export for Analysis
   → Export CSV to data/exports/
   → Use for R/Tableau
   
3. Analyze
   → Use R Markdown templates
   → Generate reports
   
4. Version Control
   → Commit raw JSON files
   → Ignore CSV exports (regenerated)
   → Ignore Tableau workbooks (large)
```

---

## Rules & Standards

### Data Storage Rules

**Raw Data (JSON):**
- Location: `data/raw/{category}/`
- Naming: `{test-name}-{date}-{game-count}games-{player-count}players.json`
- Required: Complete metadata
- Never: Delete or edit raw data files

**Exported Data (CSV):**
- Location: `data/exports/`
- Naming: `{test-name}-{date}.csv`
- Can be: Regenerated from raw data
- Purpose: Analysis in R/Tableau

See **`data/README.md`** for complete rules.

### File Naming Conventions

**Test Names:**
- Use kebab-case: `market-pricing-change`
- Be descriptive: `track-empire-threshold-increase`
- Include version if iterating: `market-pricing-v2`

**Dates:**
- Format: `YYYY-MM-DD`
- Example: `2024-01-15`

**Full Example:**
`baseline-2024-01-15-100games-2players.json`

### Minimum Sample Sizes

- **Baseline tests:** 100+ games
- **Comparison tests:** 50+ games per config
- **Quick tests:** 25+ games (preliminary only)

### Quality Standards

- **Completion rate:** >95%
- **Game length:** 6-10 rounds (target: 7-8)
- **Track balance:** Each track wins ~33% (±10%)

---

## Common Tasks

### Running a Baseline Test

1. Set up: Ensure `PlaytestEngine.js` is working
2. Run: `await engine.runBatch(100, 2, 'medium')`
3. Export: `engine.downloadCSV('baseline-2024-01-15.csv')`
4. Save: Move CSV to `data/exports/`
5. Save raw: Save JSON to `data/raw/baseline/`
6. Analyze: Use `analyze-baseline.Rmd`

### Comparing Configurations

1. Test Config A: Run playtests with config A
2. Test Config B: Run playtests with config B
3. Export both: Create CSV files
4. Compare: Use `compare-configs.Rmd`
5. Analyze: Check statistical significance

### After Making Balance Changes

1. Make change: Update `config.js`
2. Test: Run playtests with new config
3. Save: Store in appropriate folder (e.g., `after-market-change/`)
4. Compare: Compare to baseline
5. Document: Update rulebook with change and reasoning

---

## Analysis Tools

### R Markdown (Primary)

**Templates:**
- `analyze-baseline.Rmd` - Full baseline analysis
- `compare-configs.Rmd` - Configuration comparison

**Functions:**
- `load_playtest_csv()` - Load CSV data
- `calculate_track_balance()` - Calculate win rates
- `test_track_balance()` - Chi-square test
- `compare_configs()` - T-test comparison

**Output:**
- HTML reports in `analysis/reports/`
- Can export to PDF

### Tableau (Visualization)

**Purpose:**
- Interactive dashboards
- Exploration of data
- Sharing with team

**Workflow:**
1. Import CSV from `data/exports/`
2. Create visualizations (see `TABLEAU-GUIDE.md`)
3. Save workbook to `analysis/tableau/`

**Recommended Charts:**
- Game length distribution
- Track win rates
- Completion rate
- Score distributions

---

## Version Control

### What to Commit
- ✅ Raw JSON data files (source of truth)
- ✅ R Markdown files
- ✅ R utility scripts
- ✅ Documentation files
- ✅ README files

### What NOT to Commit
- ❌ CSV export files (can regenerate)
- ❌ Tableau workbooks (too large)
- ❌ Generated HTML/PDF reports
- ❌ Temporary files

### Git Ignore Files
- `data/exports/*.csv`
- `analysis/tableau/*.twbx`
- `analysis/reports/*.html`

---

## Documentation Standards

### When Documenting Changes

1. **Update rulebook:** `rulebook/rulebook.md`
2. **Record in playtesting section:**
   - Date of change
   - What changed (specific values)
   - Why changed (reasoning)
   - Test results supporting change

### Example Entry:
```markdown
### Update 3: Market Pricing
- **Date**: 2024-01-20
- **Change**: Increased slave prices from [3,4,5,6,7] to [4,5,6,7,8]
- **Reason**: Slaves were too easy to acquire, making gladiator acts dominant
- **Test Results**: After 100 games, Empire track win rate reduced from 45% to 38%
```

### Metadata Requirements

Every test run must include:
- Date
- Config version
- Number of games
- Player count
- AI difficulty
- Description of what was tested

---

## Troubleshooting

### Data Issues

**Missing data:**
- Check if test was interrupted
- Verify export completed
- Re-run if critical

**Invalid data:**
- Don't delete (keep for investigation)
- Mark as `_INVALID` or move to separate folder
- Document what's wrong
- Re-run test

### Analysis Issues

**R scripts not working:**
- Check file paths are correct
- Verify CSV format matches expected structure
- Check required packages are installed

**Tableau import errors:**
- Verify CSV format is correct
- Check data types (numbers should be numbers)
- Ensure UTF-8 encoding

---

## Best Practices

### Do's
✅ Follow naming conventions strictly
✅ Include complete metadata
✅ Store raw data in appropriate folders
✅ Document all changes in rulebook
✅ Use statistical tests for comparisons
✅ Keep baseline data forever
✅ Export CSV for analysis workflow

### Don'ts
❌ Edit raw data files manually
❌ Delete raw data files
❌ Skip metadata
❌ Make multiple changes at once (hard to isolate effects)
❌ Commit large binary files (Tableau workbooks)
❌ Analyze without adequate sample sizes

---

## Resources

### Internal Documentation
- Main plan: `PLAYTESTING-REFERENCE.md`
- Data rules: `data/README.md`
- R guide: `R-ANALYSIS-QUICKSTART.md`
- Tableau guide: `TABLEAU-GUIDE.md`

### Code Files
- Playtest engine: `js/ai/PlaytestEngine.js`
- Config: `js/utils/config.js`
- Game engine: `js/game/GameEngine.js`

### Analysis Scripts
- Data loading: `analysis/r/load-data.R`
- Balance metrics: `analysis/r/utils/balance-metrics.R`
- Baseline analysis: `analysis/r/analyze-baseline.Rmd`
- Config comparison: `analysis/r/compare-configs.Rmd`

---

## Getting Help

### Questions About:
- **Data storage:** See `data/README.md`
- **Analysis:** See `R-ANALYSIS-QUICKSTART.md`
- **Visualization:** See `TABLEAU-GUIDE.md`
- **Overall plan:** See `PLAYTESTING-REFERENCE.md`

### Issues:
- Check troubleshooting section above
- Review relevant documentation
- Check if data follows naming conventions
- Verify metadata is complete

---

*Last updated: 2024-01-15*
*Maintained by: Playtesting Team*
