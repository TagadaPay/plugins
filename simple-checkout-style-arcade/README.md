# Simple Checkout — Arcade / Y2K Style

A minimal, production-ready TagadaPay checkout plugin with a
**Y2K / retro-arcade** aesthetic. Built for gaming merch, Gen-Z
beauty, music merch, subscription beauty, late-millennial
nostalgia brands, and anyone whose storefront already commits
to high color energy.

> **Sibling of** [`simple-checkout-style-editorial`](../simple-checkout-style-editorial),
> [`simple-checkout-style-luxe`](../simple-checkout-style-luxe),
> [`simple-checkout-style-solar`](../simple-checkout-style-solar),
> [`simple-checkout-style-neon`](../simple-checkout-style-neon).
> Same SDK hooks, same behavior — different brand world.

All variants share the exact same `@tagadapay/plugin-sdk` v2 hook
surface (`useCheckout`, `usePayment`, `useShippingRates`,
`useFunnel`, `useApplePayCheckout`, `useGooglePayCheckout`).
Only the visual system differs — that's the entire point:
**one codebase, many brand worlds**.

---

## Aesthetic direction

Y2K / retro-arcade / candy. Inspired by:

- Early 2000s iMac G3 translucent plastics
- Tamagotchi UIs and Dreamcast menus
- Pokémon stat cards
- Jelly candy buttons
- Late-millennial beauty brands (Jones Road, Selena Gomez Rare)

The system in one line: **lavender surfaces over a soft
peach-to-blue page background, deep-plum type, hot-peach pill
CTA with an inner glass highlight, one sparkle moment per
section (holo gradient rule), 140ms overshoot motion.**

### Palette

| Role       | Color     | Usage                                              |
| ---------- | --------- | -------------------------------------------------- |
| Type       | `#2A1F4D` | Deep plum — all body + heading text                |
| Surface    | `#E9DCFF` | Page background (soft lavender wash)               |
| Card       | `#F3ECFF` | Card / section surface (light lavender)            |
| Primary    | `#FF9B8F` | Hot peach — CTA, selected chips                    |
| Secondary  | `#3A5BFF` | Electric blue — links, focus ring, accents         |
| Accent     | `#B89EFF` | Lavender — borders, tinted neutrals                |
| Gradient   | peach→lav→blue | The one sparkle — underlines + masthead        |

### Typography

| Role    | Font             | Weight      |
| ------- | ---------------- | ----------- |
| Display | Fraunces (opsz) | 500 / 600   |
| Body    | General Sans     | 400 / 500 / 600 / 700 |
| Prices  | JetBrains Mono   | 500 / 600   |

Display is wide + confident (Fraunces stands in for Reckless
Neue where license isn't available). Body is warm and rounded
(General Sans). Numbers stay mono — that's what keeps the system
legible and non-cartoon.

### Signature details

- **CTA**: fully-pilled peach pill, deep-plum label, inner glass
  highlight, soft peach drop glow (no dark shadow). On hover:
  `-2px` lift with overshoot cubic-bezier. On press: settles
  `+0.5px`, glow collapses. Feels like pressing a jelly.
- **Step markers**: glossy lavender pill with electric-blue mono
  number inside. `(01) PAYMENT`.
- **Section titles**: Fraunces with a 3px holo-gradient underline
  (peach → lavender → blue). This is the one sparkle per section.
- **Top bar**: lavender surface over the page gradient, "LIVE" dot
  candy-chip, Fraunces wordmark, pill "Back" button. Holo gradient
  hairline as the bottom edge.
- **Inputs**: 12px radius lavender wells with inner-glass highlight,
  electric-blue outer ring on focus (not border — a soft 3px halo).
- **Motion**: 140ms `cubic-bezier(0.34, 1.56, 0.64, 1)` — overshoot
  but ≤2px. Never longer, never bouncier.

---

## Project layout

```
simple-checkout-style-arcade/
├── plugin.manifest.json       # Plugin metadata + routing
├── STYLE.md                   # Full design manifesto
├── .impeccable.md             # Impeccable design context
├── config/
│   └── default.config.json    # Y2K defaults (peach / lavender / plum)
├── src/
│   ├── App.tsx                # Router: /checkout + /thankyou
│   ├── main.tsx
│   ├── index.css              # ⭐ Tokens + candy retrofit layer
│   ├── pages/CheckoutPage.tsx
│   ├── components/
│   │   ├── SingleStepCheckout.tsx   # ⭐ The page — start here
│   │   ├── ThemeSetter.tsx           # Candy form controls
│   │   ├── TopBar.tsx                # Lavender masthead + holo rule
│   │   └── ...                       # Shared checkout components
│   ├── components/ui/
│   │   ├── button.tsx                # ⭐ The peach jelly pill CTA
│   │   ├── section-header.tsx        # ⭐ Glossy pill + holo underline
│   │   └── ...
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   └── types/
└── README.md / STYLE.md
```

---

## Getting started

```bash
pnpm install
pnpm dev            # opens http://localhost:5173/checkout
```

Pass a checkout token via query string:

```
http://localhost:5173/checkout?checkoutToken=<TAGADA_CHECKOUT_TOKEN>
```

---

## Build & deploy

```bash
pnpm build
pnpm deploy          # or deploy:dev / deploy:staging / deploy:prod
```

---

## Pair it with sibling plugins

```
simple-checkout-style-editorial/   # Swiss-modern, olive-bronze, magazine
simple-checkout-style-neon/        # streetwear, acid lime, neobrutalist
simple-checkout-style-luxe/        # boutique, forest + gold, atelier
simple-checkout-style-solar/       # zine, cream + tomato + cobalt, indie
simple-checkout-style-arcade/      # Y2K, lavender + peach + electric blue
```

---

## License

MIT — see the parent repository root for the license file.
