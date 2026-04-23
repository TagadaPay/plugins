# STYLE.md — Luxe / Boutique

> A deliberately quiet, atelier-coded checkout for luxury DTC
> (leather goods, fragrance, high-end skincare, fashion).
> Where neon shouts and editorial states, Luxe whispers.

## Users & purpose

Shops whose brand is:

- **Quiet and considered.** Gift boxes, engraved confirmation emails,
  hand-written thank-you notes.
- **Adult.** No Gen-Z shortcuts, no meme energy, no emoji.
- **Allowed.** The customer is buying something they've earned.
  The checkout should reassure, flatter, and disappear.

The checkout must feel like part of the house, not an e-commerce
template. Competence and warmth over retail noise.

## Brand personality

| Adjective    | ✅                            | ❌                            |
| ------------ | ----------------------------- | ----------------------------- |
| Quiet        | hairline rules, 1px lines     | drop shadows, cards-in-cards  |
| Considered   | tight tracking on display     | "friendly" rounded corners    |
| Warm         | cream + bronze + gold         | sterile blue-gray fintech     |
| Grown        | display serif, small-caps     | emoji, "🔥", exclamation      |
| Tactile      | near-square radius (2px)      | pill buttons                  |

## Aesthetic direction

**Boutique / atelier.** Think: Hermès orange-as-restraint,
Aesop apothecary labels, Loro Piana catalog, the heavy cardstock
in a Galeries-Lafayette gift box, a Milanese tailor's bill.

### Typography

| Role     | Font                | Why                                                      |
| -------- | ------------------- | -------------------------------------------------------- |
| Display  | **Fraunces (opsz)** | High-contrast serif, variable optical size — warm & tight |
| Body     | **Inter Tight**     | Restrained — body should be invisible, not "branded"      |
| Prices   | **JetBrains Mono**  | Tabular lining — receipts must line up                    |

Display serif does every tone shift. Body is silent. Eyebrows and
small-caps labels use Inter Tight at `0.22em` tracking.

### Color

A three-color system:

- **Forest green** `#1F2A22` — ink, titles, borders on dark
- **Warm cream** `#F5F1E8` page / `#FBF8EF` card — surfaces
- **Aged gold** `#C7A15C` — reserved for CTA, selected rows,
  step markers. Nothing else.

Secondary neutrals are bronze-leaning: `#5C5441`, `#857B63`,
`#C9BFA4`. Every neutral has a sliver of warmth — never cool-gray.

### Composition

- **1px solid bronze** hairline borders everywhere — no 2px,
  no thicker-on-hover.
- **Cards**: `2px` radius, zero shadow, flat cream paper.
- **Buttons**: `2px` radius — nearly square, never pill.
- **Motion**: on hover, the CTA opens its tracking from `0.04em`
  to `0.06em` and darkens one shade. That's the entire animation
  system. 160ms ease-out. No bounce, no transform.
- **Step markers**: long dash (`⸻`) + gold mono number in bronze
  small-caps label. `⸻  01  PAYMENT`.
- **Section titles**: display serif with a 48px gold hairline
  rule underneath — the single ornament on the page.
- **Top bar**: cream surface with a 2px inset gold underline.
  No dark band, no ticker, no emoji.

### Things we refuse

- Pure white or pure black. Both read as "not yet branded".
- Drop shadows (`shadow-sm`, `shadow-md`, soft blur, glow, ring).
- Pill buttons. Rounded-xl / rounded-2xl cards.
- Emoji in UI copy. No "🔥", no "✨", no "🎉".
- Exclamation marks in any body copy.
- Stripe indigo, Linear purple, Vercel monochrome.
- Inter default, DM Serif, Playfair — over-used AI defaults.
- Pastel serif skincare aesthetic (Glossier, Aesop's imitators).
- Gradient text, glassmorphism, aurora backgrounds.

## Signature patterns

### The CTA

Rectangular aged-gold button, 2px radius, 1px gold-hover border,
forest-green label in 13.5px Inter Tight `0.04em` tracking,
uppercase. On hover: fill darkens to `#B38A44`, tracking opens to
`0.06em`. On press: fill darkens further. No shadow, no transform.

### Strike-through price

Original price is mono, bronze `#857B63`, with a **1px bronze**
strike bar. Below it, the new price is mono, forest-green, medium.

### Step markers

Where neon uses a filled black pill with neon-lime number, Luxe
uses a **long em-dash (`⸻`) followed by a gold mono number** in
bronze small-caps label. No filled shapes.

### Top-bar

Cream paper surface. Wordmark centered in display serif forest-green.
Left: "MAISON · VOL. 2026" in bronze small-caps. Right: small-caps
"Encrypted" tag + "Continue shopping" link with a single bronze
underline. The 2px inset gold band at the bottom is the only color.

## Where this style falls apart

- On very loud product categories (gaming, CBD drops, streetwear).
  Use `simple-checkout-style-neon` instead.
- On utility SaaS / dev-tool verticals. Use editorial.
- On pages with too many product variants visible at once — Luxe
  breaks down if the grid noise exceeds 3 columns of items.
- If the merchant cannot provide a single good product image —
  the restraint amplifies bad photography.

## Reference shops

- Hermès (restraint, orange-as-tag, heavy paper)
- Aesop (apothecary labels, quiet grids)
- Loro Piana (catalog hierarchy)
- Le Labo (serif + sans discipline)
- Apartamento Magazine (cream paper, display serif)
