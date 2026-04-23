# STYLE.md — Neon / Streetwear

> A deliberately loud, neobrutalist checkout for urban/streetwear-coded
> commerce (CBD, sneakers, streetwear, gaming, music drops).
> This is the **opposite** sibling of `simple-checkout-style-editorial`.
> Where editorial whispers, this one shouts.

## Users & purpose

Shops whose brand is:

- **Loud, chromatic, product-first.** Merchandise with neon packaging,
  sticker stacks, meme energy.
- **Gen-Z / millennial.** TikTok traffic, Instagram Stories, UGC.
- **"You had to be there."** CBD, streetwear drops, skate shops, urban
  food brands, live-stream commerce.

The checkout must feel like part of the brand, not a sterile "trust"
page. Confidence and irreverence over restraint.

## Brand personality

| Adjective     | ✅                       | ❌                            |
| ------------- | ------------------------ | ----------------------------- |
| Confident     | bold uppercase headlines | apologetic sentence case      |
| Chromatic     | one acid scream          | muted brand blue              |
| Tactile       | 2px black borders        | 1px hairline grays            |
| Playful       | emoji, stickers, slogans | sterile copy                  |
| High-contrast | black/white + neon       | tonal gray-on-gray            |

## Aesthetic direction

**Neobrutalist streetwear.** Think: `@keftiu`, `@glossier` early days,
`@huncholand`, `@palace`, `@supreme` receipts, CBD packaging culture.

### Typography

| Role     | Font              | Why                                                                 |
| -------- | ----------------- | ------------------------------------------------------------------- |
| Display  | **Archivo Black** | Single-weight heavy condensed sans — streetwear poster energy       |
| Body     | **Space Grotesk** | Geometric but warm, holds up at small sizes, refuses to be generic  |
| Prices   | **JetBrains Mono** | Bold mono with slab energy — prices are the most important numbers |

All display headings are **UPPERCASE**. No exceptions.

### Color

A three-color system:

- **Pure black** `#000000` — ink, borders, backgrounds of chrome
- **Pure white** `#FFFFFF` — primary surface
- **Acid lime neon** `#C8FF00` — reserved for primary CTA, selected
  states, promo stickers. Nothing else.

Secondary accent: **hot pink** `#FF2E88` for strike-through prices and
danger states (save/discount markers).

### Composition

- **2px solid black** borders everywhere — no 1px hairlines.
- **Cards**: `12px` radius + hard `3×3 px` black drop-shadow.
- **Buttons**: fully pilled (`999px`) — signature streetwear silhouette.
- **Motion**: on hover, everything nudges `-1px, -1px` and the shadow
  grows to `4×4` — "pressing into" the shadow. 80ms linear, no ease.
- **Step markers**: chunky black pill with neon-lime mono number
  (`01`, `02`, `03`).
- **Top bar**: solid black bar with a neon lime free-shipping ticker
  above and a boxed lime monogram on the left.

### Things we refuse

- Soft drop shadows (`shadow-sm`, `shadow-md`, `shadow-lg`). **Never.**
- Indigo/purple CTAs. The CTA is lime. That is brand.
- Drop shadows with blur. We only do hard, offset, pure-black.
- Gradient text, glassmorphism, glow rings, aurora backgrounds.
- Inter. Nunito. Open Sans. Any default Figma-template font.
- Rounded-lg (8px) cards. Either 12px+ (streetwear) or 4px (editorial).
  Never the Stripe middle-ground.

## Signature patterns

### The CTA

Fully pilled, neon-lime fill, black text, black 2px border, hard 3×3
black drop-shadow. On hover: nudge up-left, shadow grows. On press:
nudge all the way in, shadow collapses to 1px. Feels tactile like
pressing a sticker.

### Strike-through price

Original price is mono, gray, with a **2px hot-pink** strike-through
bar. Below it, the new price is mono, black, heavy.

### Step markers

Where editorial uses a hairline dash + mono number, Neon uses a
**filled black pill with a neon-lime number**. Rectangular, not round.

### Top-bar ticker

Above the logo bar sits a thin acid-lime strip with the free-shipping
promise in uppercase Archivo Black, with emoji. Announces a vibe
before any product renders.

## Where this style falls apart

- On extremely formal verticals (legal, medical, insurance) — use the
  editorial sibling instead.
- On very long product descriptions — the uppercase all-display
  headlines dominate and reading comprehension drops.
- If the merchant has no appetite for brand color — this system relies
  on a single scream color being present and strong.

## Reference shops

- Palace, Supreme, Aimé Leon Dore (streetwear)
- Glossier (early) (tactile cosmetics)
- Liquid Death (loud CPG)
- Off-White early web (Virgil-era)
