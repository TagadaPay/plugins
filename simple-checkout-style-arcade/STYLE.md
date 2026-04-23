# STYLE.md — Arcade / Y2K

> A deliberately bright, candy-coded checkout for Gen-Z /
> late-millennial DTC brands (gaming merch, beauty drops, music
> merch, subscription beauty). Where editorial whispers and solar
> stamps, Arcade *glows*.

## Users & purpose

Shops whose brand is:

- **High-color.** Storefront already commits to peach / lavender /
  electric blue / holographic treatments. A gray checkout would
  feel like a step-down.
- **Late-millennial + Gen-Z.** TikTok-adjacent. Y2K-nostalgic but
  not ironic — the customer wasn't alive in 2002, the aesthetic
  is contemporary.
- **Visual-first.** Gaming merch, makeup, scented candles for
  20-somethings, music merch, toy-collab drops.

The checkout must feel like part of the launch, not the serious
payment step. Fun must co-exist with trust.

## Brand personality

| Adjective       | ✅                              | ❌                                |
| --------------- | ------------------------------- | --------------------------------- |
| Bright          | three-color palette             | flat gray                         |
| Bouncy          | 140ms overshoot cubic-bezier    | 600ms hard easing                 |
| Nostalgic       | Fraunces, JetBrains Mono        | Inter, Poppins                    |
| Glossy          | inner-highlight + soft glow     | hard drop shadows                 |
| Controlled      | gradient used once per view     | gradient on every chip            |

## Aesthetic direction

**Y2K / retro-arcade.** Think: iMac G3 translucent blueberry
plastic, Tamagotchi UI chrome, Pokémon stat cards, late-90s
anime menu chrome, Jones Road packaging, Rare Beauty boxes.

### Typography

| Role     | Font             | Why                                                   |
| -------- | ---------------- | ----------------------------------------------------- |
| Display  | **Fraunces**     | Wide opsz display serif — confident Y2K-future        |
| Body     | **General Sans** | Warm rounded sans — candy-coded body                  |
| Prices   | **JetBrains Mono** | Tabular mono — keeps the system honest              |

### Color

Three-hue system on lavender:

- **Hot peach** `#FF9B8F` — CTA, selected, promo
- **Electric blue** `#3A5BFF` — links, focus ring, accent marks
- **Deep plum** `#2A1F4D` — ALL type (never black)
- **Lavender** `#E9DCFF` / `#F3ECFF` / `#FBF8FF` — surfaces
- **Holo gradient** peach→lavender→blue — used once per view
  (section underlines, masthead rule) — never twice on the same
  viewport.

### Composition

- **Radius range** (not one value):
  - CTAs: `999px` (fully pilled)
  - Cards: `16px` (chunky)
  - Inputs: `12px` (medium round)
  - Chips: `999px`
- **Inner highlight** `inset 0 1px 0 0 rgba(255,255,255,0.6)` on
  every raised element (CTA, card, chip, input). That's the
  jelly gloss.
- **Outer glow** uses **colored shadows** (peach/blue) not black —
  `0 4px 16px rgba(255,155,143,0.28)`.
- **Motion**: `140ms cubic-bezier(0.34, 1.56, 0.64, 1)`. Max 2px
  overshoot. Never loops.
- **Page background**: soft double radial gradient (peach top-left,
  blue top-right) — the wallpaper, not the focus.

### Things we refuse

- Pure white surfaces. Pure black type (use plum).
- Flat drop shadows with dark colors.
- Gradient on CTA *and* card *and* chip (max one per view).
- Inter, Poppins — overused AI defaults.
- Tailwind `shadow-2xl` / `blur-2xl`. Glassmorphism.
- Pixel-perfect Swiss-grid alignment — Y2K is confidently
  imperfect.
- Corporate stripe-indigo / Linear purple.
- Excessive emoji. One pulse dot is fine, four ✨ is not.

## Signature patterns

### The CTA

Fully-pilled peach jelly, deep-plum label at 14px `font-semibold`,
`rounded-full`, with inner glass highlight and soft peach glow.
On hover: `-2px` translate with overshoot cubic-bezier, glow
opens from `rgba(.28)` to `rgba(.38)`. On press: `+0.5px`,
glow collapses to tight shadow. Max 3 state changes.

### Strike-through price

JetBrains Mono in `plum-400`, with **2px peach** strike bar.
The "was" is muted, the "now" is plum-900 and glossy.

### Step markers

Glossy lavender pill `999px` with electric-blue mono number
inside. Pill has the inner-white highlight. `(01) ADDRESS`.

### Top-bar

Lavender `#F3ECFF` surface over the page gradient wallpaper.
Left: "LIVE · APR 23" candy chip with pulsing peach dot.
Center: Fraunces wordmark in plum. Right: pill "Back" button.
A 2px holo-gradient hairline along the bottom edge.

## Where this style falls apart

- On formal verticals (legal, medical, high luxury). Use `luxe`.
- On extremely minimalist brands. Use `editorial`.
- If the merchant's storefront is monochrome, the checkout will
  feel disconnected — this style only works when the storefront
  is already confidently colorful.

## Reference shops

- Jones Road Beauty (peach + candy + restraint)
- Rare Beauty (lavender + peach)
- Glossier circa 2019 (pink + glass)
- Milk Makeup (plum + candy)
- Merch drops: 100 thieves, 1OF1, pop-music artist stores
