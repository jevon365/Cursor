# UI Style Guide - Circus Maximus

This document defines the visual design system, styling choices, and UI patterns for the Circus Maximus game interface.

## 🎯 Quick Reference

**Theme**: Ancient Rome Classical - Warm Roman theme with ancient aesthetic  
**Font**: Times New Roman throughout  
**Primary Color**: `#8B0000` (Dark red - imperial)  
**Background**: `#FDF5E6` (Ivory - parchment)  
**Text**: `#2C1810` (Dark brown - ink)  

**Victory Tracks**:
- Empire: `#8B0000` (Dark red)
- Population: `#1E3A8A` (Deep blue)
- Church: `#DAA520` (Goldenrod)

**Key Principle**: Feel ancient and classical, not modern. Use warm colors, less rounded corners, classical typography.

---

## 🎨 Design Philosophy

**Goal**: Create an intuitive, visually appealing interface that makes the game mechanics clear and enjoyable to play.

**Principles**:
- **Clarity First**: Game state should be immediately understandable
- **Visual Hierarchy**: Important information stands out
- **Consistent Patterns**: Similar actions look and behave the same way
- **Responsive**: Works on different screen sizes
- **Accessible**: Clear contrast, readable text, intuitive interactions

---

## 🏛️ Theme & Aesthetic

### Current State
- Minimal MVP styling (basic grays, blues)
- Functional but not thematic
- No visual connection to ancient Rome setting

### Theme Direction
**✅ SELECTED: Ancient Rome Classical**
- **Ancient Roman aesthetic**: Marble textures, classical architecture motifs, ornate borders
- **Warm color palette**: Deep reds, golds, blues, earth tones
- **Classical typography**: Times New Roman for authentic Roman feel
- **Visual style**: Balanced - moderate decoration with clear information hierarchy
- **Goal**: Feel ancient and classical, not modern

---

## 🎨 Color System

### Current Colors
- Primary: `#3498db` (blue)
- Background: `#f5f5f5` (light gray)
- Text: `#333` (dark gray)
- Success: `#27ae60` (green)
- Error: `#e74c3c` (red)

### ✅ Final Color Palette - Warm Roman Theme

**Selected**: Warm Roman Theme with ancient aesthetic

```
Primary (Empire):     #8B0000 (dark red - Roman imperial)
Secondary (People):  #1E3A8A (deep blue - Roman citizen)
Tertiary (Church):   #DAA520 (goldenrod - Roman religious)
Background:          #FDF5E6 (ivory/cream - aged parchment)
Card Background:      #FFFFFF (white - marble)
Text Primary:         #2C1810 (dark brown - ink)
Text Secondary:       #6B4423 (brown - aged text)
Accent:              #8B4513 (saddle brown - leather)
Border:              #CD853F (peru - aged border)
Success:             #228B22 (forest green)
Error:               #8B0000 (dark red)
Warning:             #DAA520 (goldenrod)
```

**Color Rationale**:
- **Empire (Red)**: Deep crimson representing imperial power
- **Population (Blue)**: Deep blue distinguishing the people from clergy
- **Church (Gold)**: Goldenrod representing religious authority
- **Background**: Ivory/cream for aged parchment feel
- **Text**: Dark brown for classical ink appearance

### ✅ Victory Track Colors
Each track has a distinct, ancient-feeling color for quick recognition:
- **Empire Track**: `#8B0000` (dark red - imperial crimson)
- **Population Track**: `#1E3A8A` (deep blue - citizen blue)
- **Church Track**: `#DAA520` (goldenrod - religious gold)

**Track Color Usage**:
- Track labels use track color
- Track bars use gradient from light to full track color
- Track markers/borders use track color
- Numbers on tracks use track color for emphasis

### ✅ Resource Colors
Resources use warm, ancient-feeling colors:
- **Coins**: `#DAA520` (goldenrod - Roman gold)
- **Workers**: `#6B4423` (brown - earth/leather)
- **Mummers**: `#8B4513` (saddle brown - theater masks)
- **Animals**: `#8B7355` (tan - animal hide)
- **Slaves**: `#654321` (dark brown - servitude)
- **Prisoners**: `#8B0000` (dark red - captivity)

**Resource Color Usage**:
- Resource labels use resource color
- Resource icons/badges use resource color
- Resource numbers can use resource color or default text color

---

## 📝 Typography

### Current Font
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`

### ✅ Typography Selection

**Selected**: Times New Roman for entire interface (classical Roman feel)

```css
/* Base font stack - Times New Roman primary */
font-family: 'Times New Roman', 'Times', 'Georgia', serif;
```

**Font Rationale**:
- Times New Roman provides authentic classical Roman aesthetic
- Serif font feels ancient and traditional
- Consistent throughout for cohesive ancient feel
- No mixing with modern sans-serif fonts

### Font Sizes
```css
/* Headers */
h1: 2.5em (40px) - Game title
h2: 2em (32px) - Section headers
h3: 1.5em (24px) - Subsection headers
h4: 1.25em (20px) - Card titles

/* Body */
body: 1em (16px) - Base text
small: 0.875em (14px) - Secondary info
tiny: 0.75em (12px) - Labels, hints
```

### Font Weights
- **Bold (700)**: Headers, important numbers, current player
- **Semi-bold (600)**: Section labels, track names
- **Regular (400)**: Body text, resource values
- **Light (300)**: Secondary info, hints

---

## 🧩 Component Styling

### Buttons

#### Primary Action Button
```css
/* Warm Roman Theme - Ancient feel */
background: #8B0000; /* Dark red - imperial */
color: #FDF5E6; /* Ivory text */
padding: 12px 24px;
border-radius: 4px; /* Slightly less rounded for ancient feel */
font-weight: 600;
font-family: 'Times New Roman', 'Times', serif;
border: 2px solid #654321; /* Dark brown border */
cursor: pointer;
transition: all 0.2s ease;
box-shadow: 0 2px 4px rgba(0,0,0,0.2);

/* Hover */
background: #A00000; /* Slightly lighter red */
border-color: #8B4513; /* Saddle brown */
transform: translateY(-1px);
box-shadow: 0 4px 8px rgba(139,0,0,0.3);

/* Disabled */
background: #CD853F; /* Peru - aged look */
color: #8B7355; /* Tan text */
cursor: not-allowed;
opacity: 0.7;
border-color: #D2B48C; /* Tan border */
```

#### Secondary Button
```css
background: transparent;
color: #8B0000; /* Dark red */
border: 2px solid #8B0000;
font-family: 'Times New Roman', 'Times', serif;
/* Same padding, border-radius as primary */

/* Hover */
background: rgba(139,0,0,0.1); /* Light red tint */
border-color: #A00000;
```

#### Danger Button (Pass, Skip)
```css
background: #E74C3C;
color: white;
/* Same styling as primary */
```

### Cards

#### Player Card
```css
background: #FFFFFF; /* White - marble */
border: 2px solid #CD853F; /* Peru - aged border */
border-radius: 6px; /* Slightly less rounded */
padding: 16px;
box-shadow: 0 2px 6px rgba(0,0,0,0.15);
transition: all 0.2s ease;
font-family: 'Times New Roman', 'Times', serif;

/* Active/Current Player */
border-color: #8B0000; /* Dark red - imperial */
border-width: 3px;
background: #FFF8DC; /* Cornsilk - warm highlight */
box-shadow: 0 4px 12px rgba(139,0,0,0.25);
```

#### Act Card
```css
background: #FFFFFF; /* White - marble */
border: 2px solid #CD853F; /* Peru - aged border */
border-radius: 6px;
padding: 12px;
min-height: 120px;
cursor: pointer;
transition: all 0.2s ease;
font-family: 'Times New Roman', 'Times', serif;

/* Hover */
border-color: #8B0000; /* Dark red */
box-shadow: 0 4px 8px rgba(0,0,0,0.2);
transform: translateY(-2px);

/* Has Bid */
border-color: #DAA520; /* Goldenrod */
border-width: 3px;
background: #FFF8DC; /* Cornsilk - warm highlight */
```

#### Location Card
```css
background: #FFFFFF; /* White - marble */
border: 2px solid #CD853F; /* Peru - aged border */
border-radius: 6px;
padding: 16px;
cursor: pointer;
transition: all 0.2s ease;
font-family: 'Times New Roman', 'Times', serif;

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
background: #F5F5F0; /* Slightly warm gray */
border-color: #D2B48C; /* Tan */

/* Has Worker */
border-color: #8B0000; /* Dark red */
border-width: 3px;
background: #FFF8DC; /* Cornsilk - warm highlight */
```

### Input Fields

#### Text Input
```css
padding: 10px 12px;
border: 2px solid #CD853F; /* Peru - aged border */
border-radius: 4px; /* Less rounded for ancient feel */
font-size: 1em;
font-family: 'Times New Roman', 'Times', serif;
background: #FFF8DC; /* Cornsilk - parchment feel */
color: #2C1810; /* Dark brown - ink */
transition: border-color 0.2s;

/* Focus */
border-color: #8B0000; /* Dark red */
outline: none;
box-shadow: 0 0 0 3px rgba(139,0,0,0.15);
background: #FFFFFF; /* White when focused */
```

#### Number Input (Bid Amount)
```css
/* Same as text input */
width: 80px;
text-align: center;
```

### Victory Tracks

#### Track Display
```css
/* Track container */
background: #FFF8DC; /* Cornsilk - parchment */
border: 2px solid #CD853F; /* Peru - aged border */
border-radius: 6px;
padding: 12px;
margin: 8px 0;
font-family: 'Times New Roman', 'Times', serif;

/* Track bar */
height: 30px;
background: linear-gradient(to right, 
    rgba([TRACK_RGB], 0.3) 0%, 
    [TRACK_COLOR] 100%);
border-radius: 4px;
position: relative;
overflow: hidden;
border: 1px solid rgba(0,0,0,0.1);

/* Track marker (current position) */
width: 4px;
height: 100%;
background: #2C1810; /* Dark brown - ink */
position: absolute;
left: [PERCENTAGE]%;
border-left: 2px solid #FDF5E6; /* Ivory highlight */
box-shadow: 0 0 4px rgba(0,0,0,0.3);
```

**Track-Specific Colors**:
- **Empire**: `rgba(139,0,0,0.3)` to `#8B0000`
- **Population**: `rgba(30,58,138,0.3)` to `#1E3A8A`
- **Church**: `rgba(218,165,32,0.3)` to `#DAA520`

#### Track Labels
```css
font-weight: 600;
color: [TRACK_COLOR];
margin-bottom: 4px;
```

### Market Display

#### Market Resource
```css
display: flex;
align-items: center;
gap: 12px;
padding: 10px;
background: #FFFFFF; /* White - marble */
border: 1px solid #CD853F; /* Peru - aged border */
border-radius: 4px;
cursor: pointer;
transition: all 0.2s;
font-family: 'Times New Roman', 'Times', serif;

/* Available */
border-left: 4px solid [RESOURCE_COLOR];

/* Sold/Unavailable */
opacity: 0.5;
cursor: not-allowed;
border-left-color: #D2B48C; /* Tan */
background: #F5F5F0; /* Warm gray */
```

#### Price Badge
```css
background: [PRIMARY_COLOR];
color: white;
padding: 4px 8px;
border-radius: 4px;
font-size: 0.875em;
font-weight: 600;
min-width: 32px;
text-align: center;
```

---

## 📐 Layout Principles

### Grid System
- **Main Container**: Max-width 1400px, centered
- **Game Board**: Grid layout, responsive columns
- **Player Cards**: Flexbox, wrap on smaller screens
- **Actions Panel**: Grid, auto-fit columns (min 200px)

### Spacing Scale
```css
/* Consistent spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
```

### Component Spacing
- **Between sections**: 24px (spacing-lg)
- **Within cards**: 16px (spacing-md)
- **Between items in list**: 8px (spacing-sm)
- **Button padding**: 12px 24px

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
    /* Stack columns, smaller fonts */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
    /* 2-column layouts */
}

/* Desktop */
@media (min-width: 1025px) {
    /* Full multi-column layouts */
}
```

---

## 🎯 Visual Hierarchy

### Information Priority
1. **Critical**: Current phase, current player, available actions
2. **Important**: Player resources, victory tracks, act cards
3. **Secondary**: Market state, location details, game progress
4. **Tertiary**: Help text, hints, tooltips

### Visual Emphasis
- **Size**: Larger = more important
- **Color**: Brighter/saturated = attention
- **Position**: Top-left = primary focus
- **Contrast**: High contrast = important info
- **Animation**: Subtle motion = draw attention

---

## ✨ Animations & Transitions

### Principles
- **Subtle**: Don't distract from gameplay
- **Fast**: 0.2-0.3s for most transitions
- **Purposeful**: Only animate important state changes

### Common Animations

#### Button Hover
```css
transition: all 0.2s ease;
transform: translateY(-1px);
```

#### Card Hover
```css
transition: all 0.2s ease;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0,0,0,0.15);
```

#### Phase Transition
```css
/* Fade out old, fade in new */
opacity: 0;
transition: opacity 0.3s ease;
```

#### Track Movement
```css
/* Smooth position updates */
transition: left 0.5s ease;
```

#### Success/Error Messages
```css
/* Slide in from top */
animation: slideDown 0.3s ease;
```

---

## 🎴 Specific Component Guidelines

### Phase Display
- **Large, clear label**: "Phase: Bid on Acts"
- **Icon or color coding**: Each phase has distinct visual
- **Progress indicator**: Show turn order, who's passed

### Player Cards
- **Current player**: Highlighted border, background tint
- **Resources**: Icon + number, color-coded
- **Tracks**: Mini track bars or numbers
- **Workers**: Available/Placed clearly shown

### Act Cards
- **Layout**: Title, cost, rewards, current bids
- **Bid indicator**: Show who bid what
- **Selectable**: Visual feedback on hover/click
- **Execution acts**: Distinct styling (red border?)

### Location Board
- **Grid layout**: 2-3 columns, responsive
- **Worker indicators**: Show player colors/icons
- **Disabled state**: Grayed out, no interaction
- **Cost display**: Worker cost clearly shown

### Market Display
- **Resource rows**: Left-to-right pricing
- **Price tiers**: Visual price progression
- **Sold indicators**: Strikethrough or grayed
- **Buy button**: Per resource or click-to-buy

### Victory Tracks
- **Three columns**: One per track
- **Track bars**: Visual progress indicators
- **Numbers**: Current value prominent
- **Range**: Show min/max (-10 to 20)

---

## 🎨 Icons & Imagery

### Icon Usage
**TODO: User Preference**
- [ ] **Text-only**: No icons, just labels
- [ ] **Simple icons**: Unicode symbols (⚡, 🏛️, 👥)
- [ ] **Icon font**: Font Awesome, Material Icons
- [ ] **SVG icons**: Custom SVG graphics

### Resource Icons (if using)
- **Coins**: 💰 or coin icon
- **Workers**: 👷 or worker icon
- **Mummers**: 🎭 or theater mask
- **Animals**: 🐘 or animal icon
- **Slaves**: ⛓️ or chain icon
- **Prisoners**: 🔒 or prison icon

### Phase Icons (if using)
- **Bid on Acts**: 🎪 or gavel
- **Place Workers**: 📍 or location pin
- **Buy Resources**: 🛒 or shopping cart
- **Perform Acts**: 🎬 or stage
- **Cleanup**: 🔄 or refresh

---

## 📱 Responsive Design

### Mobile (< 768px)
- **Stack all columns**: Single column layout
- **Smaller fonts**: Reduce by 10-15%
- **Touch targets**: Minimum 44px height
- **Collapsible sections**: Accordion for player cards
- **Bottom action bar**: Fixed position for actions

### Tablet (768px - 1024px)
- **2-column layouts**: Player cards, locations
- **Full market**: All resources visible
- **Side-by-side tracks**: 3 columns if space allows

### Desktop (> 1024px)
- **Multi-column**: Full grid layouts
- **Sidebar**: Optional info panel
- **Hover states**: Full interaction feedback

---

## ♿ Accessibility

### Color Contrast
- **Text on background**: Minimum 4.5:1 ratio
- **Interactive elements**: Minimum 3:1 ratio
- **Don't rely on color alone**: Use icons, labels, patterns

### Keyboard Navigation
- **Tab order**: Logical flow through interface
- **Focus indicators**: Clear outline on focused elements
- **Keyboard shortcuts**: Optional for power users

### Screen Readers
- **Semantic HTML**: Use proper heading hierarchy
- **ARIA labels**: For complex interactions
- **Alt text**: For icons/images

---

## 🔧 Implementation Notes

### CSS Organization
```css
/* 1. Variables/Custom Properties */
:root { /* colors, spacing, etc */ }

/* 2. Reset/Base Styles */
* { /* box-sizing, margins */ }

/* 3. Layout */
.container { /* grid, flexbox */ }

/* 4. Components */
.button { /* button styles */ }
.card { /* card styles */ }

/* 5. Utilities */
.text-center { /* utility classes */ }
```

### CSS Variables (Recommended)
```css
:root {
    /* Colors - Warm Roman Theme */
    --color-empire: #8B0000;           /* Dark red - imperial */
    --color-population: #1E3A8A;       /* Deep blue - citizen */
    --color-church: #DAA520;           /* Goldenrod - religious */
    --color-primary: #8B0000;           /* Primary action color */
    --color-primary-dark: #A00000;     /* Primary hover */
    --color-background: #FDF5E6;       /* Ivory - parchment */
    --color-card: #FFFFFF;             /* White - marble */
    --color-text: #2C1810;              /* Dark brown - ink */
    --color-text-secondary: #6B4423;    /* Brown - aged text */
    --color-border: #CD853F;            /* Peru - aged border */
    --color-accent: #8B4513;            /* Saddle brown */
    --color-success: #228B22;           /* Forest green */
    --color-error: #8B0000;             /* Dark red */
    --color-warning: #DAA520;          /* Goldenrod */
    --color-highlight: #FFF8DC;         /* Cornsilk - warm highlight */
    
    /* Resource Colors */
    --color-coins: #DAA520;
    --color-workers: #6B4423;
    --color-mummers: #8B4513;
    --color-animals: #8B7355;
    --color-slaves: #654321;
    --color-prisoners: #8B0000;
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Typography */
    --font-family: 'Times New Roman', 'Times', 'Georgia', serif;
    --font-size-base: 16px;
    --font-weight-normal: 400;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    /* Borders */
    --border-radius: 6px;
    --border-radius-small: 4px;
    --border-width: 2px;
    --border-width-thick: 3px;
    
    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-md: 0 2px 6px rgba(0,0,0,0.15);
    --shadow-lg: 0 4px 12px rgba(0,0,0,0.2);
}
```

---

## ✅ Style Checklist

Before considering UI "complete", verify:
- [ ] Color scheme applied consistently
- [ ] Typography hierarchy clear
- [ ] Buttons have hover/active states
- [ ] Cards have proper spacing and shadows
- [ ] Tracks are visually distinct
- [ ] Resources are color-coded
- [ ] Current player clearly highlighted
- [ ] Disabled states are obvious
- [ ] Error messages are visible
- [ ] Responsive on mobile/tablet
- [ ] Animations are smooth
- [ ] Focus states for keyboard nav
- [ ] Contrast meets accessibility standards

---

## 📝 Notes & Decisions Log

**Date**: 2024
- ✅ **Theme Selected**: Ancient Rome Classical - warm Roman theme with ancient feel
- ✅ **Color Palette**: Warm Roman Theme with distinct track colors
  - Empire: Dark red (#8B0000)
  - Population: Deep blue (#1E3A8A) - distinct from Church
  - Church: Goldenrod (#DAA520)
- ✅ **Typography**: Times New Roman throughout for classical feel
- ✅ **Visual Style**: Balanced - moderate decoration, ancient aesthetic
- ✅ **Component Colors**: Updated all examples with selected palette
- ✅ **CSS Variables**: Defined complete variable system

**Design Rationale**:
- Colors chosen to feel ancient and warm, not modern
- Blue for Population creates clear distinction from gold Church track
- Times New Roman provides authentic classical Roman aesthetic
- Ivory/cream backgrounds evoke aged parchment
- Brown text colors suggest classical ink
- Less rounded borders (4-6px) feel more classical than modern (8px+)

**Future Updates**:
- Add texture overlays if needed (subtle marble/parchment)
- Consider decorative borders for cards (optional)
- Add screenshots/mockups as UI develops
- Refine based on gameplay feedback

---

## 🎯 Next Steps

1. ✅ **Theme selected** - Warm Roman, ancient aesthetic
2. ✅ **Color palette finalized** - Warm Roman theme with distinct track colors
3. ✅ **Typography chosen** - Times New Roman throughout
4. **Implement base styles** in `style.css` using CSS variables
5. **Build component styles** following examples in this guide
6. **Apply ancient aesthetic** - less rounded corners, warm colors, classical feel
7. **Test responsive** layouts
8. **Refine based on** gameplay feedback

**Ready for Implementation**: All style decisions are finalized. The guide is ready to use as reference for implementing the UI.
