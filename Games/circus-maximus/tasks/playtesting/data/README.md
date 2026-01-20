# Playtesting Data Storage - Rules & Procedures

## Overview

This directory contains all playtesting data files. Follow these rules to maintain data integrity, ensure reproducibility, and enable effective analysis.

---

## Directory Structure

```
data/
├── raw/                    # Original playtest results (JSON format)
│   ├── baseline/          # Baseline/initial test runs
│   ├── config-comparison/ # A/B testing of different configs
│   └── after-market-change/ # Tests after specific changes
└── exports/               # Processed data for analysis (CSV format)
```

---

## Rules & Procedures

### 1. File Naming Conventions

**Raw Data (JSON):**
Format: `{test-name}-{date}-{game-count}games-{player-count}players.json`

Examples:
- `baseline-2024-01-15-100games-2players.json`
- `market-change-v2-2024-01-20-50games-4players.json`
- `config-a-slaves-pricing-2024-01-22-75games-3players.json`

**Exported Data (CSV):**
Format: `{test-name}-{date}.csv`

Examples:
- `baseline-2024-01-15.csv`
- `config-comparison-2024-01-20.csv`

**Rules:**
- Use lowercase with hyphens (kebab-case)
- Always include date in YYYY-MM-DD format
- Include game count and player count in raw files
- Be descriptive: include what changed (e.g., `market-change`, `track-adjustment`)

---

### 2. Data Storage Rules

#### Raw Data (JSON)
- **Location:** `data/raw/{test-category}/`
- **Format:** JSON only (no other formats in raw/)
- **Naming:** Must follow naming convention above
- **Required Metadata:** Every JSON file must include:
  ```json
  {
    "metadata": {
      "testRun": "baseline-2024-01-15",
      "date": "2024-01-15",
      "configVersion": "v1.0",
      "description": "Initial balance test",
      "playerCount": 2,
      "difficulty": "medium",
      "gameCount": 100
    },
    "results": [...]
  }
  ```
- **DO NOT:**
  - Edit raw data files manually
  - Delete raw data files (they are the source of truth)
  - Store duplicate files
  - Store temporary or test files in raw/

#### Exported Data (CSV)
- **Location:** `data/exports/`
- **Format:** CSV only (UTF-8 encoding)
- **Purpose:** For analysis in R and Tableau
- **Derived From:** Raw JSON files
- **Naming:** Should match raw file name (without extension/details)
- **Allowed Actions:**
  - Regenerate from raw data at any time
  - Delete and recreate (raw data is source of truth)

---

### 3. File Organization

#### Raw Data Categories

**`baseline/`**
- Initial test runs before any balance changes
- Use for establishing baseline metrics
- Keep ALL baseline runs (never delete)

**`config-comparison/`**
- A/B tests comparing two configurations
- Naming: `config-a-{description}-{date}-{count}games.json`
- Naming: `config-b-{description}-{date}-{count}games.json`
- Always test same number of games for fair comparison

**`after-market-change/`** (or other specific change folders)
- Tests after specific balance adjustments
- Create new folder for each major change category
- Name folder descriptively: `after-market-change`, `after-track-adjustment`, etc.

#### When to Create New Folders

Create a new folder in `raw/` when:
- Testing a different category of change
- You want to group related tests together
- There are 5+ files in a category

Examples:
- `after-market-change/` - All market pricing tests
- `after-track-adjustment/` - All victory track tests
- `after-act-balance/` - All act card balance tests

---

### 4. Data Collection Standards

#### Minimum Requirements
- **Baseline tests:** 100+ games minimum
- **Comparison tests:** 50+ games per configuration (for statistical significance)
- **Quick tests:** 25+ games (only for preliminary checks)

#### Metadata Required
Every test run must include:
- Date of test
- Config version (from `config.js`)
- Number of games run
- Player count tested
- AI difficulty level
- Description of what was tested/changed

#### Data Quality Checks
Before saving, verify:
- [ ] All games have `completed: true` OR valid reason for `completed: false`
- [ ] Completion rate is >95% (or investigate failures)
- [ ] No duplicate game IDs
- [ ] All required fields present
- [ ] Metadata is complete

---

### 5. Version Control

#### What to Commit
- ✅ Raw JSON data files (they are the source of truth)
- ✅ README files and documentation
- ✅ Analysis scripts (R Markdown files)
- ❌ Exported CSV files (can be regenerated)
- ❌ Tableau workbooks (too large, use `.gitignore`)

#### Git Ignore
Add to `.gitignore`:
```
data/exports/*.csv
analysis/tableau/*.twbx
analysis/reports/*.html
*.log
```

#### Commit Messages
Format: `playtesting: {action} - {description}`

Examples:
- `playtesting: add baseline test - 100 games, 2 players`
- `playtesting: add config comparison - market pricing change`
- `playtesting: export baseline data for analysis`

---

### 6. Data Retention

#### Keep Forever
- All baseline test data
- All configuration comparison data
- Any test that was used in published analysis

#### Can Delete After Analysis
- Duplicate exports (CSV files)
- Temporary test files (if clearly marked)
- Files explicitly marked as "temp" or "test"

#### Archive Old Data
If storage becomes an issue:
1. Create `archive/` folder
2. Move old test runs there
3. Document what was archived and why

---

### 7. Data Sharing & Collaboration

#### Sharing Raw Data
- Share entire `raw/` folder or specific subfolder
- Include README explaining file naming
- Share metadata about config version tested

#### Sharing Exported Data
- Share CSV from `exports/` folder
- Include description of what test it's from
- Include date of export

#### Documentation
When sharing data, always include:
- What was tested
- When it was tested
- Config version used
- Any known issues or outliers

---

### 8. File Maintenance

#### Regular Tasks
- **Weekly:** Clean up temporary files in `exports/`
- **Monthly:** Review and organize `raw/` subfolders
- **After Major Analysis:** Archive old comparison tests

#### File Size Limits
- JSON files: <10MB each (if larger, split into multiple files)
- CSV files: <50MB each (if larger, consider filtering)

#### Backup
- Raw data should be backed up regularly
- Exported CSV can be regenerated (lower priority)

---

### 9. Data Access Patterns

#### For Analysis (R/Tableau)
1. Load from `exports/` folder (CSV format)
2. If CSV doesn't exist, export from raw JSON first
3. Use `analysis/r/load-data.R` functions

#### For Comparison
1. Locate raw JSON files for each config
2. Export both to CSV
3. Use `analysis/r/compare-configs.Rmd` template

#### For Review
1. Check raw JSON files directly
2. Use browser/editor JSON viewer
3. Check metadata for context

---

### 10. Error Handling

#### Invalid Data
If you discover invalid data:
1. **DO NOT** delete the file (preserve for investigation)
2. Create `_INVALID` suffix or move to `invalid/` folder
3. Document what's wrong in README or comments
4. Re-run test if possible

#### Missing Data
If data is missing:
1. Document what's missing
2. Check if it was never collected or lost
3. If lost, mark original file as incomplete
4. Re-run if critical

#### Corrupted Files
If file is corrupted:
1. Try to recover from backup
2. If not recoverable, mark as lost
3. Re-run test if possible
4. Document the loss

---

## Examples

### Example 1: Baseline Test
```
File: data/raw/baseline/baseline-2024-01-15-100games-2players.json
Metadata:
  - testRun: "baseline"
  - date: "2024-01-15"
  - configVersion: "v1.0"
  - description: "Initial balance test before any changes"
  - playerCount: 2
  - gameCount: 100
```

### Example 2: Config Comparison
```
Files:
  - data/raw/config-comparison/config-a-market-pricing-2024-01-20-50games-2players.json
  - data/raw/config-comparison/config-b-market-pricing-2024-01-20-50games-2players.json
Metadata:
  - testRun: "market-pricing-comparison"
  - description: "Comparing original pricing vs increased slave prices"
  - configA: "v1.0"
  - configB: "v1.1"
```

### Example 3: After Change Test
```
File: data/raw/after-market-change/market-pricing-increase-2024-01-22-75games-3players.json
Metadata:
  - testRun: "after-market-change"
  - date: "2024-01-22"
  - configVersion: "v1.1"
  - description: "Testing after increasing slave market prices by 1 coin"
  - change: "Slave prices: [3,4,5,6,7] -> [4,5,6,7,8]"
```

---

## Quick Reference Checklist

**Before Saving Data:**
- [ ] Follows naming convention
- [ ] Includes complete metadata
- [ ] Stored in correct directory
- [ ] Data quality checks passed
- [ ] No duplicate files

**Before Analysis:**
- [ ] Data exported to CSV (if needed)
- [ ] CSV in `exports/` folder
- [ ] File name matches raw data name
- [ ] Documentation available

**Before Committing:**
- [ ] Raw data file (if new)
- [ ] Updated README (if structure changed)
- [ ] CSV files in `.gitignore` (not committed)

---

## Questions or Issues?

If you're unsure about:
- Where to store a file → Check directory structure above
- How to name a file → See naming conventions
- Whether to commit → See version control rules
- Data quality issues → See error handling

**When in doubt:**
1. Keep raw data (don't delete)
2. Be descriptive in naming
3. Document in metadata
4. Ask before making structural changes

---

*Last updated: 2024-01-15*
*Maintained by: Playtesting Team*
