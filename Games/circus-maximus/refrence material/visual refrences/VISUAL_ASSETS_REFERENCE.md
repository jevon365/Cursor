# Visual Assets Reference

This document lists all visual assets used in the Circus Maximus UI overhaul and how they should be used.

## Location

All visual assets are located in: `refrence material/visual refrences/`

## Assets List

### 1. City Backdrop Image

**File**: `game_board_reffrence.jpeg`

**Description**: 
Ancient Roman cityscape illustration showing:
- Central amphitheater (center-right) - Large oval structure, visual centerpiece
- Coastal port with lighthouse (right/top-right) - Ships, docks, lighthouse
- Grand temples and public buildings (upper left/center) - White columns, pediments
- Open-air marketplace (bottom-left, near forest) - Market stalls with awnings
- Dense residential areas (throughout) - Terracotta-roofed buildings
- Forest area (far left) - Dense green trees

**Usage**:
- **Primary**: Background image for the central game board area
- **CSS**: Set as `background-image` on `.city-backdrop` container
- **Path**: `refrence material/visual refrences/game_board_reffrence.jpeg`
- **Styling**: `background-size: cover`, `background-position: center`

**Location Positioning** (based on image features):
- **Port**: Right coastal area, near lighthouse (x: 85%, y: 75%)
- **War**: Upper right, military structures (x: 75%, y: 25%)
- **Forest**: Far left, dense forest (x: 5%, y: 50%)
- **Palace**: Upper left, grand temple (x: 15%, y: 15%)
- **Town Square**: Near market area (x: 15%, y: 70%)
- **Pantheon**: Behind amphitheater, upper center (x: 50%, y: 20%)
- **Prison**: Mid-left, residential (x: 25%, y: 55%)
- **Guildhall**: Mid-center, public building (x: 40%, y: 45%)
- **Oracle**: Upper mid, temple (x: 35%, y: 25%)
- **Gamblers Den**: Mid-right, residential (x: 70%, y: 50%)
- **Mummers Market**: Left side of market area (x: 12%, y: 75%)
- **Animals Market**: Center of market area (x: 18%, y: 75%)
- **Slaves Market**: Right side of market area (x: 24%, y: 75%)

**Implementation Batch**: Batch 5 (City Backdrop and Location Spots)

---

### 2. Victory Track Icons

#### Empire Track Icon

**File**: `Empire_icon.png`

**Description**: Icon representing the Empire victory track

**Usage**:
- Displayed in Empire track label
- Size: 24px x 24px recommended
- Position: Left side of track label, before "Empire" text
- **Path**: `refrence material/visual refrences/Empire_icon.png`

**Implementation Batch**: Batch 3 (Victory Tracks Panel)

---

#### Population Track Icon

**File**: `population_icon.png`

**Description**: Icon representing the Population victory track

**Usage**:
- Displayed in Population track label
- Size: 24px x 24px recommended
- Position: Left side of track label, before "Population" text
- **Path**: `refrence material/visual refrences/population_icon.png`

**Implementation Batch**: Batch 3 (Victory Tracks Panel)

---

#### Church Track Icon

**File**: `clergy_icon.png`

**Description**: Icon representing the Church victory track

**Note**: The file is named "clergy_icon.png" but represents the "Church" track in the game. This is correct - "clergy" = "church" in game terminology.

**Usage**:
- Displayed in Church track label
- Size: 24px x 24px recommended
- Position: Left side of track label, before "Church" text
- **Path**: `refrence material/visual refrences/clergy_icon.png`

**Implementation Batch**: Batch 3 (Victory Tracks Panel)

---

## Path References

### From Project Root (HTML/CSS)

```css
/* In CSS files at project root */
background-image: url('../refrence material/visual refrences/game_board_reffrence.jpeg');
```

```html
<!-- In HTML -->
<img src="../refrence material/visual refrences/Empire_icon.png" alt="Empire" />
```

### From JavaScript Files (js/ui/)

```javascript
// In JS files in js/ui/ folder
const backdropPath = '../../refrence material/visual refrences/game_board_reffrence.jpeg';
const iconPath = '../../refrence material/visual refrences/Empire_icon.png';
```

### Alternative: Copy to images/ Folder

For simpler paths, you can copy assets to `images/` folder in project root:

```
images/
  game_board_reffrence.jpeg
  Empire_icon.png
  population_icon.png
  clergy_icon.png
```

Then reference as:
```css
background-image: url('images/game_board_reffrence.jpeg');
```

---

## Usage by Batch

| Batch | Component | Asset Used |
|-------|-----------|------------|
| Batch 1 | Layout Foundation | (Reference only - assets used later) |
| Batch 2 | Player Panels | None |
| Batch 3 | Victory Tracks | Empire_icon.png, population_icon.png, clergy_icon.png |
| Batch 4 | Markets Panel | None |
| Batch 5 | City Backdrop | game_board_reffrence.jpeg |
| Batch 6 | Round Info Panel | None |
| Batch 7 | Phase Indicator | None |
| Batch 8 | Action Log | None |
| Batch 9 | Integration | All assets |
| Batch 10 | Polish | All assets |

---

## Implementation Notes

1. **Backdrop Image**:
   - Must be loaded before positioning location spots
   - Use `background-size: cover` to fill container
   - Ensure image doesn't distort (maintain aspect ratio)
   - Location spots are positioned absolutely over the backdrop

2. **Track Icons**:
   - Use `<img>` tags with proper `alt` attributes
   - Size consistently (24px x 24px)
   - Align with track label text
   - Ensure icons are visible on track-colored backgrounds

3. **Path Handling**:
   - Test paths work from your file location
   - Consider copying assets to `images/` folder for simpler paths
   - Verify assets load in browser (check Network tab)

4. **Performance**:
   - Optimize backdrop image if needed (compress, but maintain quality)
   - Icons should be small file sizes
   - Consider lazy loading if needed

---

## Verification Checklist

Before considering implementation complete:

- [ ] Backdrop image (`game_board_reffrence.jpeg`) loads and displays
- [ ] All 13 location spots positioned on backdrop
- [ ] Track icons (Empire_icon.png, population_icon.png, clergy_icon.png) display in track labels
- [ ] All assets load without 404 errors
- [ ] Assets display correctly at different screen sizes
- [ ] No broken image icons
- [ ] Assets are properly sized and positioned

---

*This reference will be updated if additional visual assets are added.*
