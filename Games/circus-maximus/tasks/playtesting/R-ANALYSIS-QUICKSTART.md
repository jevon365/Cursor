# R & Tableau Analysis - Quick Start Guide

## Overview

**Primary Tools: R (R Markdown) + Tableau**

This is your quick reference for analyzing playtest data with R and Tableau.

---

## Workflow

```
1. Collect → Run playtests in JavaScript (export to CSV/JSON)
2. Analyze → Use R Markdown for statistical analysis
3. Visualize → Use Tableau for interactive dashboards
4. Report → Generate HTML/PDF reports from R Markdown
```

---

## Step 1: Export Data from JavaScript

After running playtests, export to CSV:

```javascript
const engine = new PlaytestEngine();
await engine.runBatch(100, 2, 'medium');
engine.downloadCSV('baseline-2024-01-15.csv');
```

Save to: `playtesting/data/exports/`

---

## Step 2: Analyze in R Markdown

### Load Data

```r
# In R Markdown
source("load-data.R")
df <- load_playtest_csv("../data/exports/baseline-2024-01-15.csv")
```

### Run Analysis

Use the provided R Markdown templates:

- **`analyze-baseline.Rmd`** - Baseline analysis report
- **`compare-configs.Rmd`** - Compare two configurations

**Key Functions Available:**
- `load_playtest_csv()` - Load CSV data
- `load_playtest_json()` - Load JSON data
- `calculate_track_balance()` - Calculate track win rates
- `calculate_game_length_stats()` - Game length statistics
- `test_track_balance()` - Chi-square test for balance
- `compare_configs()` - Compare two configs

### Generate Report

```r
# In RStudio
rmarkdown::render("analyze-baseline.Rmd")
```

Output: HTML report in `analysis/reports/`

---

## Step 3: Visualize in Tableau

### Import Data

1. Open Tableau Desktop
2. Connect → Text File → Select your CSV
3. Verify data types (numbers should be numbers)

### Create Visualizations

**Essential Charts:**
1. **Game Length Distribution** (Histogram)
   - Columns: `rounds`
   - Rows: `Number of Records`
   - Add reference line at Mean (target: 7-8 rounds)

2. **Track Win Rates** (Bar Chart)
   - Columns: `win_track`
   - Rows: `Number of Records` (as percentage)
   - Add reference line at 33.3%

3. **Completion Rate** (Pie Chart)
   - Color: `completed`
   - Show percentage

See `TABLEAU-GUIDE.md` for detailed instructions.

### Save Dashboard

Save as Tableau workbook (`.twbx`) in `analysis/tableau/`

---

## File Structure

```
playtesting/
├── data/
│   └── exports/
│       └── baseline-2024-01-15.csv       # Export from JavaScript
├── analysis/
│   ├── r/
│   │   ├── load-data.R                   # Data loading functions
│   │   ├── analyze-baseline.Rmd          # Baseline analysis
│   │   ├── compare-configs.Rmd           # Config comparison
│   │   └── utils/
│   │       ├── balance-metrics.R         # Balance calculations
│   │       └── visualizations.R          # Reusable viz functions
│   ├── tableau/
│   │   └── playtest-analysis.twbx        # Tableau workbook
│   └── reports/
│       └── baseline-analysis.html        # R Markdown output
```

---

## Common Analyses

### Check Game Length

```r
# In R Markdown
round_stats <- df %>%
  filter(completed == TRUE) %>%
  summarise(
    mean = mean(rounds),
    sd = sd(rounds),
    min = min(rounds),
    max = max(rounds)
  )

# Target: 6-10 rounds
# Check: mean >= 6 & mean <= 10
```

### Check Track Balance

```r
# In R Markdown
track_balance <- calculate_track_balance(df)
balance_test <- test_track_balance(df)

# Target: Each track ~33% (±10%)
# Check: All tracks between 23%-43%
```

### Compare Configurations

```r
# In R Markdown
config_a <- load_playtest_csv("../data/exports/config-a.csv")
config_b <- load_playtest_csv("../data/exports/config-b.csv")

comparison <- compare_configs(config_a, config_b, "rounds")

# Check: p-value < 0.05 means significant difference
```

---

## Quick Reference

### R Packages Needed

```r
install.packages(c(
  "dplyr",
  "tidyr",
  "ggplot2",
  "knitr",
  "kableExtra",
  "jsonlite",
  "readr"
))
```

### Key Metrics to Track

| Metric | Target | Red Flag |
|--------|--------|----------|
| Mean game length | 7-8 rounds | <6 or >10 rounds |
| Track win rates | 33% each (±10%) | One track >50% |
| Completion rate | >95% | <90% |
| Game length std dev | <2 rounds | >3 rounds |

### R Functions Reference

```r
# Load data
df <- load_playtest_csv("path/to/file.csv")

# Calculate balance
track_balance <- calculate_track_balance(df)
game_length <- calculate_game_length_stats(df)

# Test balance
balance_test <- test_track_balance(df)

# Compare configs
comparison <- compare_configs(df1, df2, "rounds")

# Confidence intervals
ci <- calculate_confidence_interval(df, "rounds")

# Outliers
outliers <- identify_outliers(df, "rounds")
```

---

## Next Steps

1. **Run baseline tests** → Export to CSV
2. **Analyze in R Markdown** → Generate report
3. **Visualize in Tableau** → Create dashboard
4. **Make balance adjustments** → Re-test
5. **Compare configs** → Use `compare-configs.Rmd`
6. **Document findings** → Update rulebook

---

**Need help?** Check the full guides:
- `DATA-STORAGE-ANALYSIS.md` - Complete data storage guide
- `TABLEAU-GUIDE.md` - Detailed Tableau instructions
- `analysis/r/analyze-baseline.Rmd` - Complete analysis template
