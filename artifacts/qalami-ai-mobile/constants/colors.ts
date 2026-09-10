/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#ffffff',
    tint: '#7C4DFF',

    // Core surfaces
    background: '#020203',
    foreground: '#ffffff',

    // Cards / elevated surfaces
    card: '#0d0d11',
    cardForeground: '#ffffff',

    // Primary action color (buttons, links, active states)
    primary: '#7C4DFF',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#17151e',
    secondaryForeground: '#ffffff',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#17151e',
    mutedForeground: '#8d8b97',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#2a1b58',
    accentForeground: '#ffffff',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#26232e',
    input: '#191720',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
