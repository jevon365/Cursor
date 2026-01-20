# Tableau Playtesting Analysis Guide

## Overview

This guide shows how to use Tableau to analyze and visualize playtest data from Circus Maximus.

---

## Data Preparation

### Step 1: Export Data to CSV

From JavaScript, export playtest results to CSV format:

```javascript
// In PlaytestEngine.js
const engine = new PlaytestEngine();
await engine.runBatch(100, 2, 'medium');
engine.downloadCSV('baseline-2024-01-15.csv');
```

### Step 2: Import to Tableau

1. Open Tableau Desktop
2. Connect to Data → Text File
3. Select your CSV file
4. Review data types (verify numeric fields are numbers, not strings)

---

## Recommended Visualizations

### 1. Game Length Distribution

**Purpose:** Check if games are too short/long

**Steps:**
1. Drag `rounds` to Columns
2. Drag `Number of Records` to Rows
3. Change mark type to Bar
4. Add reference line at Mean (target: 7-8 rounds)
5. Add reference line at Median

**What to Look For:**
- Mean should be between 6-10 rounds
- Distribution should be roughly normal (not skewed heavily)
- Outliers indicate potential issues

### 2. Victory Track Win Rates

**Purpose:** Check if all tracks are balanced

**Steps:**
1. Drag `win_track` to Columns
2. Drag `Number of Records` to Rows
3. Add calculated field: `Win Rate = COUNT([win_track]) / TOTAL(COUNT([win_track]))`
4. Format as percentage
5. Add reference line at 33.3% (expected for balanced game)

**What to Look For:**
- Each track should win ~33% of games (±10%)
- If one track wins >50%, it's too strong
- If one track wins <20%, it's too weak

### 3. Track Win Distribution (Stacked Bar)

**Purpose:** Visualize track balance at a glance

**Steps:**
1. Drag `win_track` to Columns
2. Drag `Number of Records` to Rows
3. Change mark type to Stacked Bar
4. Color by `win_track`
5. Show percentage of total on label

### 4. Game Length by Player Count

**Purpose:** Check if game length scales with player count

**Steps:**
1. Drag `player_count` to Columns
2. Drag `rounds` to Rows (aggregate as Average)
3. Add error bars (show standard deviation)
4. Add reference line at 7-8 rounds

**What to Look For:**
- Game length should be similar across player counts
- If 4-player games are much longer, consider adjustments

### 5. Final Scores by Winning Track

**Purpose:** See if winning scores vary by track

**Steps:**
1. Drag `win_track` to Columns
2. Drag `p1_total`, `p2_total` (etc.) to Rows
3. Create calculated field: `Final Score = MAX([p1_total], [p2_total])`
4. Use Box Plot mark type to show distribution

**What to Look For:**
- Scores should be similar regardless of winning track
- If one track requires much higher scores, it may be harder

### 6. Completion Rate

**Purpose:** Check if games are completing properly

**Steps:**
1. Drag `completed` to Columns
2. Drag `Number of Records` to Rows
3. Show percentage of total
4. Add color: Green for completed=True, Red for completed=False

**What to Look For:**
- Completion rate should be >95%
- Low completion rate indicates bugs or infinite loops

### 7. Duration vs Rounds (Scatter Plot)

**Purpose:** Check performance/performance issues

**Steps:**
1. Drag `rounds` to Columns
2. Drag `duration_ms` to Rows
3. Change mark type to Circle
4. Add trend line
5. Size by `player_count`

**What to Look For:**
- Linear relationship expected (more rounds = more time)
- Outliers may indicate performance issues
- Very long durations suggest optimization needed

---

## Dashboard Setup

### Recommended Dashboard Layout

**Top Section:**
- Game Length Distribution (bar chart)
- Victory Track Win Rates (bar chart)

**Middle Section:**
- Track Win Distribution (stacked bar)
- Completion Rate (pie chart)

**Bottom Section:**
- Game Length by Player Count (bar with error bars)
- Duration vs Rounds (scatter plot)

### Filters

Add filters for:
- `test_run` (compare different test batches)
- `player_count` (filter by player count)
- `difficulty` (filter by AI difficulty)
- `completed` (filter out incomplete games)

---

## Comparison Analysis

### Comparing Two Configurations

**Step 1: Prepare Data**
- Export both configs to CSV
- In Tableau, union the two tables
- Add a `config` field to identify which config each row belongs to

**Step 2: Create Comparison Dashboard**
1. Side-by-side comparisons:
   - Config A vs Config B game length
   - Config A vs Config B track win rates
   - Config A vs Config B completion rates

2. Use color to distinguish configs:
   - Config A = Blue
   - Config B = Orange

3. Add calculated fields:
   - `Difference in Rounds = AVG([rounds]) - AVG([rounds])` (filtered by config)

---

## Calculated Fields for Tableau

### Track Balance Score

```
// 0 = perfectly balanced, 1 = completely imbalanced
ABS([Empire Win Rate] - 0.333) + 
ABS([Population Win Rate] - 0.333) + 
ABS([Church Win Rate] - 0.333)
```

### Acceptable Game Length

```
// 1 = acceptable, 0 = not acceptable
IF [rounds] >= 6 AND [rounds] <= 10 THEN 1 ELSE 0 END
```

### Win Track (from winner name)

```
// Extract track from winner info
CASE [win_track]
  WHEN "empire" THEN "Empire"
  WHEN "population" THEN "Population"
  WHEN "church" THEN "Church"
  ELSE "Unknown"
END
```

---

## Best Practices

1. **Always filter out incomplete games** for balance analysis
   - Filter: `[completed] = TRUE`

2. **Use consistent colors** across dashboards
   - Empire = Red
   - Population = Blue
   - Church = Gold/Yellow

3. **Include sample sizes** in visualizations
   - Show counts in labels
   - Add subtitles with "n = X games"

4. **Document your dashboards**
   - Add titles with test date
   - Include notes about what each chart shows
   - Add interpretation guidelines

5. **Export dashboards** for reports
   - File → Export → Image (for reports)
   - Save as Tableau workbook (.twbx) for future reference

---

## Example Tableau Workbook Structure

```
Playtest Analysis.twbx
├── Data Sources
│   ├── Baseline Data (CSV)
│   ├── Config A Data (CSV)
│   └── Config B Data (CSV)
├── Worksheets
│   ├── Game Length Distribution
│   ├── Track Win Rates
│   ├── Completion Rate
│   ├── Comparison View
│   └── Detailed Metrics
└── Dashboards
    ├── Baseline Analysis
    ├── Configuration Comparison
    └── Summary Report
```

---

## Quick Reference

**Key Metrics to Track:**
- Mean game length: 7-8 rounds (target)
- Track win rates: ~33% each (±10%)
- Completion rate: >95%
- Game duration: Linear with rounds
- Final scores: Similar across tracks

**Red Flags:**
- One track wins >50% of games
- Mean game length <6 or >10 rounds
- Completion rate <90%
- Large variance in game length (>3 rounds std dev)

---

## Exporting from Tableau to R Markdown

If you want to include Tableau visualizations in R Markdown:

1. Create visualization in Tableau
2. File → Export → Image (PNG or PDF)
3. Save to `analysis/r/figures/`
4. Reference in R Markdown:
   ```r
   knitr::include_graphics("figures/track-win-rates.png")
   ```

---

*Last updated: 2024-01-15*
