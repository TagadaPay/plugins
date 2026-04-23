# STYLE.md — Solar / Zine

> A deliberately warm, risograph-coded checkout for indie DTC
> brands (food, drinks, candles, soap, small-batch apparel).
> Where luxe whispers and neon shouts, Solar *stamps*.

## Users & purpose

Shops whose brand is:

- **Handmade-coded.** Screen-printed labels, linocut logos,
  small-batch runs, "Made in [small town]" back copy.
- **Playful.** Fishwife, Graza, Fly By Jing, Omsom DNA. Confident
  without being sterile.
- **Food-first or object-first.** Hot sauce, olive oil, candles,
  small-batch apparel drops.

The checkout must feel like the direct-mail box: warm cream
inside, red-stamp customs label, a receipt typed on a Royal.
Zero corporate sterility.

## Brand personality

| Adjective    | ✅                         | ❌                            |
| ------------ | -------------------------- | ----------------------------- |
| Sunlit       | sun-bleached cream surface | pure white                    |
| Confident    | thick tomato + cobalt rules| hairline grey dividers        |
| Handmade     | rotated stamps (-1°)       | pixel-perfect Figma alignment |
| Typed        | mono eyebrows & numbers    | Inter labels                  |
| Controlled   | 3 named accent colors      | 7-color gradients             |

## Aesthetic direction

**Risograph / zine.** Think: farmers-market sign, typewriter'd
zine spread, linocut block print, customs-red stamp on cream
paper. Fishwife packaging. Graza olive-oil bottles.

### Typography

| Role     | Font               | Why                                              |
| -------- | ------------------ | ------------------------------------------------ |
| Display  | **Clash Display**  | Chunky geometric sans — zine headline energy     |
| Body     | **Switzer**        | Warm crisp body — restrained but not Inter       |
| Prices   | **JetBrains Mono** | Typewriter slab — every number is mono           |

All eyebrows and form labels are **mono uppercase** at `0.1em`
tracking. Headlines are Clash Display at heavy weight.

### Color

A three-accent system:

- **Tomato** `#D64535` — CTA, step markers, promo stamps
- **Cobalt** `#2E4BD2` — secondary chips, links, accent rules
- **Olive** `#727339` — tertiary ornament (rare)

Plus cream `#F6EFD9` / paper `#FDF8E7` surfaces and charcoal
`#1A1915` type. Neutrals all carry warmth — never cool-gray.

### Composition

- **2px solid charcoal** borders on cards and inputs. No 1px
  hairlines — everything has weight.
- **Cards**: 2px radius, zero *fake* shadow (but the "stamp"
  shadow `3px 3px 0 currentColor` is allowed on accent tags).
- **Buttons**: 2px radius, stamp shadow, tomato default.
- **Motion**: 100ms linear translate on hover/press, matching
  the flip-the-zine-page cadence. No bounces.
- **Step markers**: small tomato stamp rotated `-1°` with cream
  mono number inside. `[01] PAYMENT`.
- **Section titles**: Clash Display + a 3px cobalt underline rule.
- **Top-bar**: 3px tomato stripe on top of cream masthead. No
  dark band. The cobalt dot + "ISSUE · 04.2026" is the masthead.

### Things we refuse

- Pure white backgrounds. Pure black type (we use `#1A1915`).
- Pill buttons. Rounded-xl cards.
- Soft drop shadows (`shadow-sm`, `shadow-md`, blur).
- Pastel gradients. Glassmorphism.
- Inter. Poppins. Default Figma template fonts.
- Emoji in UI copy (but `🌞` / `🌶️` are fine as product copy).
- Stripe indigo. Linear purple. Vercel monochrome.

## Signature patterns

### The CTA

Tomato-red rectangle, 2px radius, 2px charcoal border, 3×3
charcoal stamp shadow. Cream label in Switzer 13.5px uppercase
`0.02em`. On hover: nudges `-1px` up-left, shadow grows to 4×4.
On press: slams into the shadow, shadow collapses to 1×1. Like a
rubber stamp being pressed.

### Strike-through price

Original price in JetBrains Mono bronze with a **2px tomato** bar
through it. New price mono charcoal, heavy. Receipt-honest.

### Step markers

Rotated tomato stamp (`-1°`) with cream mono number. Followed by
a mono uppercase label at `0.12em`. `[01] ADDRESS`.

### Top-bar

Cream paper, 3px tomato stripe on top. Left: cobalt dot + Clash
Display wordmark. Center: rotated "ISSUE · MM.YYYY" stamp. Right:
mono "Encrypted" chip + cream "Back" button with charcoal shadow.

## Where this style falls apart

- On extremely formal verticals (legal, medical, luxury watches).
  Use `luxe` or `editorial` instead.
- On extremely loud verticals (CBD, streetwear drops). Use `neon`.
- On minimalist brands that want "less" — Solar is confident
  noise, not restraint.

## Reference shops

- Fishwife (canned fish, zine-coded packaging)
- Graza (olive oil, bold rules + cream)
- Omsom (Southeast Asian sauces, tomato-red)
- Fly By Jing (chili crisp, red + cream + serif)
- Boy Smells (candles, playful minimalism)
