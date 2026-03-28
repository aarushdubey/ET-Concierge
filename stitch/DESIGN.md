# Design System Document: The Editorial Concierge

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Private Office"**

This design system moves away from the sterile, modular appearance of traditional Fintech and toward the bespoke world of high-end editorial and private banking. The aesthetic is built on the tension between **Classic Authority** (the serif typography and cream foundations) and **Modern Precision** (the vibrant primary orange and fluid motion).

To break the "template" look, we reject the rigid grid in favor of **Intentional Asymmetry**. Elements should feel curated rather than placed—using generous white space, overlapping text containers, and high-contrast typography scales to create a sense of effortless luxury. This is not a dashboard; it is a premium service experience.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in a warm, "Cream" foundation that feels more human than pure white, punctuated by a "Deep Black" for gravity and a "Primary Orange" for modern energy.

*   **Primary (#b02f00):** Reserved for high-intent actions and critical brand moments.
*   **Surface Foundation (#fef9f3):** The primary canvas. It should feel like high-grade heavy-stock paper.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Definition must be achieved through background shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to define its boundary.
*   **Surface Hierarchy:** Use `surface-container-lowest` to `surface-container-highest` to create a "nested" physical depth.
*   **The Glass & Gradient Rule:** Floating cards or navigation bars should utilize Glassmorphism. Use `surface` at 80% opacity with a `20px` backdrop-blur. For primary CTAs, apply a subtle linear gradient from `primary` (#b02f00) to `primary_container` (#ff5722) at a 135-degree angle to add "soul" and dimension.

---

## 3. Typography: The Editorial Voice
We pair the intellectual rigor of a serif with the functional clarity of a geometric sans-serif.

*   **Display & Headlines (Newsreader/Playfair Display):** These are our "Editorial Hooks." Use `display-lg` (3.5rem) for hero statements. Tighten letter-spacing by -2% to give headlines a custom, "printed" feel.
*   **Body & Titles (Manrope/DM Sans):** The functional engine. Use `body-md` (0.875rem) for most interface text. Manrope’s modern proportions ensure readability even in complex financial data.
*   **Hierarchy as Brand:** Use extreme scale contrast. A `display-lg` headline paired with a `label-sm` (all-caps, tracked out 10%) creates an immediate high-end fashion/finance aesthetic that feels modern and trustworthy.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is "felt" rather than "seen." We avoid heavy drop shadows in favor of natural light physics.

*   **The Layering Principle:** Stack surfaces to create lift. An "Information Card" (`surface-container-lowest`) placed on a "Page Section" (`surface-container-low`) creates a soft, natural elevation without a single shadow.
*   **Ambient Shadows:** When an element must float (e.g., a modal), use a `24px` blur with 4% opacity of `on-surface` (#1d1b18). The shadow should be slightly tinted with the background color to appear as a natural occlusion of light.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` token at 15% opacity. It should be a suggestion of a line, not a boundary.
*   **Motion (Float & Marquee):** Use a "Float" animation (Y-axis translate: 10px, ease-in-out) for hero imagery to suggest lightness. Use a slow "Marquee" for ticker-style financial data to convey a sense of constant, live movement.

---

## 5. Components

### Buttons
*   **Primary:** High-gloss gradient (`primary` to `primary_container`). `0.375rem` (md) roundedness. Typography: `title-sm` (Medium weight).
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Text-only in `primary` color, using a `2px` underline that expands on hover.

### Input Fields
*   **Styling:** Forgo the "box" look. Use a `surface-container-low` background with a bottom-only `outline-variant` (20% opacity).
*   **States:** On focus, the bottom border transitions to `primary` (#b02f00) and the background shifts to `surface-container-lowest`.

### Cards & Lists
*   **Strict Rule:** No dividers. Separate items using `spacing-6` (2rem) of vertical white space or by alternating between `surface-container-low` and `surface-container-lowest` backgrounds.
*   **Interaction:** On hover, a card should scale by 1.02x and slightly increase its ambient shadow depth.

### Signature Component: The "Concierge Marquee"
A full-width, slow-scrolling banner using `label-md` typography. Use this for live market updates or service availability. It provides a "High-Tech" heartbeat to the "High-Touch" editorial design.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a headline offset to the left with body text pushed to the right).
*   **Do** use the `surface-container` scale to create nested "micro-environments" for different types of data.
*   **Do** embrace large amounts of "Cream" (`surface`) space to signify luxury.

### Don’t:
*   **Don’t** use 100% black (#000000). Always use `Deep Black` (#0d0d0d) or `on-surface` (#1d1b18) for text to maintain a premium softness.
*   **Don’t** use standard "Material" or "Bootstrap" roundedness. Stick to the `md` (0.375rem) and `lg` (0.5rem) scale for a balanced, architectural feel.
*   **Don’t** use more than one "Primary Orange" element per viewport. It is a spotlight, not a floodlight.

---

## 7. Spacing & Rhythm
Use the **1.4x Scale** for breathing room. 
*   Standard section padding should be `spacing-16` (5.5rem).
*   Internal component grouping should use `spacing-3` (1rem).
*   Always favor "too much" space over "just enough." Space is the ultimate signifier of a premium concierge service.