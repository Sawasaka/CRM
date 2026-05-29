# Design System Document: Liquid Obsidian & Cinematic Depth

> Source-of-truth note:
> This document is the highest-level design authority for the public website and
> the brand world. For logged-in product screens, use
> `SERVICE_DESIGN_SYSTEM.md` as the practical application layer, but keep this
> document and the actual homepage implementation as the final reference for
> tone, color, depth, and motion. If the service guide conflicts with the HP
> design direction, the HP direction wins and the service guide should be
> updated.

## 1. Overview & Creative North Star
### The Creative North Star: "Liquid Obsidian"
This design system is built upon the concept of **Liquid Obsidian**. It treats the digital interface not as a flat grid of boxes, but as a deep, cinematic space where light and shadow define form. We move beyond the "template" look by embracing extreme visual hierarchy, intentional asymmetry, and tonal depth that feels both heavy and fluid.

The goal is to evoke the feeling of a high-end physical product—like the finish of a MacBook Pro—where the transition between materials is seamless. We achieve this through "The Breathable Void": using expansive negative space to force focus onto high-contrast typography and hero imagery, creating a storytelling experience rather than a functional utility.

---

## 2. Colors & Surface Philosophy
The palette is rooted in absolute depth. We do not use "grey"; we use varying levels of obsidian and midnight tones to create a sense of environment.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or containers. 
- Boundaries must be defined solely through **Background Color Shifts**. For example, a `surface_container_low` section sitting against a `surface` background.
- Structural separation is achieved through vertical whitespace (see Spacing) rather than lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface_container` tiers to create "nested" depth:
- **Base Layer:** `surface` (#131315) or `surface_container_lowest` (#0e0e10).
- **Secondary Layer:** `surface_container_low` (#1b1b1d) for large content blocks.
- **Floating/Action Layer:** `surface_container_highest` (#353437) for interactive elements like cards or modals.

### The "Glass & Gradient" Rule
To achieve the premium "Liquid" aesthetic:
- **Glassmorphism:** Use `surface_container_highest` at 60% opacity with a `backdrop-filter: blur(20px)`. This is the signature for navigation bars and floating overlays.
- **Signature Textures:** Main CTAs or Hero text should utilize subtle gradients (e.g., `primary` #abc7ff to `primary_container` #0071e3) to provide a "chromatic" soul that flat colors cannot mimic.

---

## 3. Typography
Our typography strategy relies on the tension between the modern, wide-set **Plus Jakarta Sans** and the functional clarity of **Inter**.

- **Display & Headline (Plus Jakarta Sans):** These are your "Editorial Anchors." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create a commanding presence.
- **Body & Titles (Inter):** These handle the "Information Density." `body-md` (0.875rem) provides a technical, refined contrast to the bold headlines.
- **Hierarchy through Contrast:** Always pair an extreme `display-lg` headline with a significantly smaller `body-lg` or `label-md` caption. This "High-Low" pairing is the hallmark of premium digital storytelling.

---

## 4. Elevation & Depth
We reject traditional drop shadows in favor of **Tonal Layering**.

### The Layering Principle
Depth is achieved by "stacking" surface tokens. Place a `surface_container_high` card on a `surface_container_low` background. The subtle shift in hex value provides a sophisticated, natural lift.

### Ambient Shadows
If an element must "float" (e.g., a primary modal):
- **Blur:** 40px - 80px.
- **Opacity:** 4% - 8%.
- **Color:** Use a tinted version of `on_surface` (#e4e2e4) rather than black to simulate light dispersion in a dark room.

### The "Ghost Border" Fallback
If a border is required for accessibility, it must be a **Ghost Border**:
- Use `outline_variant` (#414753) at **10-15% opacity**.
- 100% opaque, high-contrast borders are strictly forbidden.

---

## 5. Components

### Buttons
- **Primary:** `primary_container` (#0071e3) background with `on_primary_container` (#fcfbff) text. Apply `ROUND_EIGHT` (0.5rem) corner radius. Use a subtle inner glow on hover.
- **Secondary (Ghost):** No background. `outline` color for text. On hover, transition to a `surface_container_high` background.
- **Tertiary:** Text-only with a chevron, using `primary` (#abc7ff).

### Cards & Containers
- **Visual Rule:** No dividers. Separate content using `surface_container` shifts.
- **Roundedness:** Use `xl` (1.5rem) for main content cards to create a friendly but refined "Pro" look. Use `md` (0.75rem) for nested items.

### Input Fields
- **Background:** `surface_container_lowest`.
- **Border:** Ghost Border (10% `outline_variant`).
- **Focus State:** 1px solid `primary` (#abc7ff) with a 4px `primary` outer glow at 10% opacity.

### Chips
- Use `secondary_container` for the background and `on_secondary_container` for the text. Keep them small (`label-sm`) and pill-shaped (`full` roundedness).

---

## 6. Do's and Don'ts

### Do:
- **Embrace the Dark:** Use `background` (#131315) as your primary canvas.
- **Use "Liquid" Motion:** Animate transitions with a slow, purposeful "ease-in-out" (e.g., cubic-bezier(0.4, 0, 0.2, 1)).
- **Negative Space:** Give headlines room to breathe. A `display-lg` headline should often have at least 120px of vertical padding.

### Don't:
- **Don't use pure #000000 for everything:** Use the `surface` tokens to ensure depth is visible on high-end OLED screens.
- **Don't use Dividers:** If you feel the need to add a line, use a spacing increment from the scale instead.
- **Don't crowd the UI:** Premium is defined by what you leave out. If a component isn't essential to the "story," remove it.

### Accessibility Note
Ensure that all `on_surface` text against `surface` backgrounds maintains a contrast ratio of at least 4.5:1. Use the `primary_fixed_dim` and `secondary_fixed_dim` tokens to maintain readability in dark mode without causing eye strain.
